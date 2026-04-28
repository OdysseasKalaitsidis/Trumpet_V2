<?php
/**
 * PDO database connection factory.
 * Returns a singleton PDO instance configured for MySQL 8.
 * Uses connection over TCP (127.0.0.1) which also works via UNIX socket
 * when MySQL is configured with skip-networking=0.
 */

declare(strict_types=1);

use Dotenv\Dotenv;

// Load .env if not already loaded (idempotent)
if (!isset($_ENV['DB_HOST'])) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

static $pdo = null;

if ($pdo === null) {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $_ENV['DB_HOST'] ?? '127.0.0.1',
        $_ENV['DB_PORT'] ?? '3306',
        $_ENV['DB_NAME'] ?? 'trumpet'
    );

    $pdo = new PDO(
        $dsn,
        $_ENV['DB_USER'] ?? 'trumpet_user',
        $_ENV['DB_PASS'] ?? '',
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
}

return $pdo;
