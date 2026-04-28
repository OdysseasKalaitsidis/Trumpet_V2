<?php
/**
 * Settings helper — thin wrapper around $_ENV for typed access.
 * All values come from .env (loaded by database.php or index.php).
 */

declare(strict_types=1);

return [
    'api_key'        => $_ENV['API_KEY']        ?? '',
    'azure_conn_str' => $_ENV['AZURE_STORAGE_CONNECTION_STRING'] ?? '',
    'azure_container'=> $_ENV['AZURE_CONTAINER_NAME'] ?? 'media',
    'resources_path' => $_ENV['RESOURCES_PATH'] ?? '/var/www/trumpet/resources',
    'python_bin'     => $_ENV['PYTHON_BIN']     ?? '/usr/bin/python3',
    'python_services'=> $_ENV['PYTHON_SERVICES_PATH'] ?? '/var/www/trumpet/python_services',
];
