# Unified Dockerfile: Nginx + PHP 8.3 + Python + MySQL (bundled, no external DB needed)
FROM php:8.3-fpm-alpine

# Install system dependencies (including MySQL server)
RUN apk add --no-cache \
    nginx \
    supervisor \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    python3 \
    py3-pip \
    libzip-dev \
    oniguruma-dev \
    mysql \
    mysql-client

# Disable skip-networking in default MariaDB configuration to allow TCP loopback connections
RUN sed -i 's/skip-networking/#skip-networking/g' /etc/my.cnf.d/*.cnf

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/trumpet

# Copy Nginx config
COPY ./nginx/trumpet.conf /etc/nginx/http.d/default.conf

# Copy application code
COPY ./Backend /var/www/trumpet/Backend
COPY ./python_services /var/www/trumpet/python_services
RUN mkdir -p /var/www/trumpet/resources
COPY ./Frontend /var/www/trumpet/Frontend

# Copy database files (schema + dump for first-boot import)
COPY ./database/schema.sql /var/www/trumpet/database/schema.sql
COPY ./database/dump.sql   /var/www/trumpet/database/dump.sql

# Install Backend dependencies
WORKDIR /var/www/trumpet/Backend
RUN composer install --no-interaction --no-plugins --no-scripts

# Build Frontend (VITE_API_BASE_URL="" so /api/items etc. use relative paths — same origin)
WORKDIR /var/www/trumpet/Frontend
RUN apk add --no-cache nodejs npm
RUN npm install
RUN VITE_API_BASE_URL="" npm run build
RUN mkdir -p /usr/share/nginx/html && cp -r dist/* /usr/share/nginx/html/

# Setup Python environment
WORKDIR /var/www/trumpet/python_services
RUN python3 -m venv venv
RUN ./venv/bin/pip install -r requirements.txt

# Setup Supervisor to run Nginx, PHP-FPM, and MySQL
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy and make entrypoint executable
COPY ./scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/trumpet

EXPOSE 80
# Entrypoint handles first-boot MySQL init, then starts supervisord
CMD ["/usr/local/bin/docker-entrypoint.sh"]
