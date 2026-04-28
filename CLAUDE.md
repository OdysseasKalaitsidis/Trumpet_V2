# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Project Overview

**Trumpet** is a production-grade digital archive for library systems. It uses a lean, high-performance architecture optimized for low resource consumption.

## Commands

### Backend (from `backend/`)
```bash
composer install             # Install PHP dependencies
# Configuration: cp .env.example .env
# Start local PHP server (for dev only):
php -S localhost:8000 -t public/
```

### Database (from `database/`)
```bash
# Initialize MySQL schema:
mysql -u root -p < schema.sql
# Port data from legacy SQLite:
python3 migrate_sqlite.py ../data/database/trumpet.db ../database/dump.sql
mysql -u root -p trumpet < dump.sql
```

### Frontend (from `Trumpet.Frontend/`)
```bash
npm install         # Install dependencies
npm run dev         # Start dev server (requires backend running)
npm run build       # Build for production (served by Nginx)
```

## Architecture

### Backend (`backend/`)
- **PHP 8.3** with **Slim 4** micro-framework.
- **MySQL 8** (InnoDB) using **PDO** for database access.
- **Service Pattern**: Controllers delegate to logic-heavy services (`ItemsService.php`, etc.).
- **Security**: `ApiKeyMiddleware.php` enforces `X-API-Key` on all `/api/*` routes.
- **Media**: `StorageService.php` generates Azure Blob SAS URLs or falls back to local file paths.

### Python CLI Shims (`python_services/`)
- Standalone Python scripts handle specialized logic (Tagging, Recommendations).
- Called by PHP via `shell_exec()`. Use only standard library modules.

### Infrastructure (`nginx/`)
- **Nginx** handles static frontend files and proxies API requests to PHP-FPM.
- Single-origin deployment eliminates CORS complexity.

### Frontend (`Trumpet.Frontend/`)
- **React 19** + **TypeScript** + **Vite**.
- Tailwind CSS for styling.
- API base URL set to `/api` for production parity.

## Data Layout
```
backend/           # Slim 4 Source
database/          # SQL Schema & Migration
nginx/             # Nginx Vhost Config
python_services/   # Logic shims
resources/         # Local media assets
Trumpet.Frontend/  # React Source
```
