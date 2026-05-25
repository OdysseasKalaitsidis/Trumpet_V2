#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Trumpet Docker Entrypoint
# Initialises MySQL on first boot, then starts all services via supervisord.
# ─────────────────────────────────────────────────────────────────────────────
set -e

MYSQL_DATA_DIR="/var/lib/mysql"
INIT_MARKER="$MYSQL_DATA_DIR/.trumpet_initialized"

# DB credentials come from environment variables set by Container Apps
DB_NAME="${DB_NAME:-trumpet}"
DB_USER="${DB_USER:-trumpetadmin}"
DB_PASS="${DB_PASS:-changeme}"

echo "==> [Entrypoint] Starting Trumpet container..."

# ── Step 1: Initialise MySQL data directory if it doesn't exist ────────────
if [ ! -f "$INIT_MARKER" ]; then
    echo "==> [Entrypoint] First boot — initialising MySQL..."

    # Ensure correct ownership and directory creation for MariaDB
    mkdir -p /run/mysqld "$MYSQL_DATA_DIR"
    chown -R mysql:mysql /run/mysqld "$MYSQL_DATA_DIR"

    # Initialise the data directory using MariaDB installer
    mariadb-install-db --user=mysql --datadir="$MYSQL_DATA_DIR"

    # Start MariaDB temporarily (no networking) to set up users
    /usr/bin/mariadbd --user=mysql --skip-networking &
    MYSQL_PID=$!

    # Wait for MySQL to be ready
    for i in $(seq 1 30); do
        if mysqladmin ping --silent 2>/dev/null; then
            break
        fi
        sleep 1
    done

    # Create database, user, and import schema
    mysql -u root <<-SQL
        CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
        CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
        CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
        GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
        GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
        GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
        FLUSH PRIVILEGES;
SQL

    # Always import database schema first
    echo "==> [Entrypoint] Importing database schema..."
    mysql -u root "${DB_NAME}" < /var/www/trumpet/database/schema.sql

    # Import the SQL dump data if it exists
    if [ -f "/var/www/trumpet/database/dump.sql" ]; then
        echo "==> [Entrypoint] Importing database dump data..."
        mysql -u root "${DB_NAME}" < /var/www/trumpet/database/dump.sql
        echo "==> [Entrypoint] Database dump data imported successfully."
    fi

    # Stop the temporary MariaDB instance
    mysqladmin -u root shutdown
    wait "$MYSQL_PID" 2>/dev/null || true
    sleep 2

    # Mark as initialised so we skip this on subsequent boots
    touch "$INIT_MARKER"
    echo "==> [Entrypoint] MySQL initialisation complete."
else
    echo "==> [Entrypoint] MySQL already initialised — skipping setup."
fi

# ── Step 2: Hand off to supervisord (starts nginx, php-fpm, mysqld) ────────
echo "==> [Entrypoint] Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
