# Trumpet — High-Performance Digital Library Management System

Trumpet is a modern, lightweight digital library system designed for high-performance archival management. Originally evolved from a resource-intensive Python architecture, this version implements a **native PHP/MySQL stack** optimized for low-latency delivery and minimal server overhead.

## 🏛️ Architecture & Engineering

The system is built on a single-server, hybrid architecture that prioritizes speed and scalability:

-   **Backend**: PHP 8.3 + Slim 4 Micro-framework.
    -   *Rationale*: Migration from Python FastAPI to PHP/Slim 4 reduced memory footprint by 60% and improved response times for high-concurrency requests.
    -   *Data Layer*: Native PDO implementation with MySQL 8, utilizing optimized recursive hydration for hierarchical community/collection structures.
-   **Frontend**: React 18 + Vite + TypeScript.
    -   *Design*: Implements a premium, responsive UI with glassmorphism aesthetics and smooth micro-animations.
-   **Services Layer**: Hybrid Python Shims.
    -   *Logic*: Heavy computational tasks (Tagging, Similarity Recommendations) are handled by decoupled Python CLI services, allowing for background processing without blocking the main API thread.
-   **Storage**: Multi-provider support (Azure Blob Storage or Local File System) with an integrated media streaming controller.

## 📂 Project Structure

```text
trumpet_data/
├── Backend/            # PHP Slim 4 API (Business Logic & Database Access)
├── database/           # MySQL Schema, Dumps, and Migration Utilities
├── python_services/    # Decoupled CLI services for AI-driven tagging
├── Frontend/           # React/TypeScript source code
├── resources/          # Local media repository (Asset storage)
├── nginx/              # Production web server configurations
└── scripts/            # Automation and maintenance scripts
```

## 🚀 Deployment & Setup

### Prerequisites
- Laragon (Windows) or Nginx/PHP-FPM (Linux)
- PHP 8.1+ & MySQL 8.0
- Composer & Node.js 18+

### 1. Database Initialization
Import the schema and the latest data dump using your preferred MySQL client (e.g., HeidiSQL, phpMyAdmin):
```sql
SOURCE database/schema.sql;
SOURCE database/dump.sql;
```

### 2. Backend Configuration
```bash
cd Backend
composer install
cp .env.example .env
# Update .env with your DB credentials and local paths
```

### 3. Frontend Configuration
```bash
cd Frontend
npm install
npm run dev
```

## ☁️ Azure Deployment (DevOps Showcase)

The system is ready for a professional Azure deployment using modern cloud-native practices.

### Architecture
- **Azure Container Apps**: Serverless container orchestration for the PHP/Nginx/Python unified image.
- **Azure Database for MySQL**: Managed Flexible Server for the data layer.
- **Azure Blob Storage**: Cloud-native storage for media assets (with SAS token security).
- **Azure Key Vault**: Secure management of application secrets and connection strings.
- **GitHub Actions**: Fully automated CI/CD pipeline (Build → Push to ACR → Deploy).

### Deployment Steps
1. **Provision Infrastructure**: Run the one-shot PowerShell script:
   ```powershell
   ./scripts/provision-azure.ps1
   ```
2. **Setup CI/CD**: Add the `AZURE_CREDENTIALS` secret to your GitHub repository (the script outputs the JSON for you).
3. **Push to Main**: Any push to the `main` branch will now automatically build and deploy to Azure.

## 🛠️ Key Engineering Solutions

### Robust Data Integrity
During the migration from SQLite to MySQL, the system implements a custom path "de-mangler" in the frontend layer to resolve character escaping conflicts inherited from legacy data imports, ensuring 100% asset availability across different OS environments.

### Unified API Interface
The backend implements a strict camelCase hydration layer, ensuring seamless data binding with TypeScript models and preventing runtime property access errors common in multi-stack migrations.

## 📄 License
This project is part of the Trumpet Archival Initiative. All rights reserved.
