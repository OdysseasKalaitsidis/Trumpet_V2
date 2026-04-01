# DevOps Handover: Trumpet Digital Archive

This document provides all technical details required for the DevOps team to deploy the Trumpet project to Azure.

## 1. System Architecture

The project is a containerized full-stack application:
- **Backend**: Python 3.11 (FastAPI + SQLModel). Port 80 inside container.
- **Frontend**: React 19 (Vite) served via Nginx. Port 80 inside container.
- **Database**: SQLite (requires persistence via Azure Files).

## 2. Infrastructure Requirements

The following Azure resources are expected:
1.  **Azure Container Registry (ACR)**: To store `trumpet-backend` and `trumpet-frontend` images.
2.  **Azure App Service (Web App for Containers)**: Two apps (Backend and Frontend) under a Linux App Service Plan (min B1).
3.  **Storage Account**:
    -   **Azure Files Share**: For persisting the SQLite database (must be mounted to `/data` in the backend).
    -   **Blob Storage Container**: Optional, for high-performance media storage (migrated via backend script).

## 3. Environment Configuration

### Backend (`trumpet-backend-app`)
Set these variables in the **App Service Configuration**:
| Variable | Description | Example / Production Value |
|----------|-------------|----------------------------|
| `DATABASE_URL` | SQLite connection string | `sqlite:////data/trumpet.db` |
| `ALLOWED_ORIGINS` | CORS restricted origins | `https://your-frontend.azurewebsites.net` |
| `AZURE_STORAGE_CONNECTION_STRING` | (Optional) Blob Storage Key | *Connection string from Portal* |
| `RESOURCES_PATH` | Local media path | `/app/resources` |
| `PYTHONDONTWRITEBYTECODE` | Python optimization | `1` |

> [!IMPORTANT]
> **Volume Mount**: You **must** mount an Azure File Share to the mount path `/data` in the backend container to persist the SQLite database across restarts.

### Frontend (`trumpet-frontend-app`)
The frontend is built with **Vite**. The backend URL must be injected at build time:
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | The public URL of your backend App Service. |

## 4. CI/CD Pipeline (`.github/workflows/deploy.yml`)

The repository includes a GitHub Actions workflow that:
1.  Logs into ACR.
2.  Builds both images.
3.  Pushes to ACR.
4.  Deploys to Azure Web Apps using Publish Profiles.

**Required GitHub Secrets**:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_BACKEND_APP_NAME`
- `AZURE_FRONTEND_APP_NAME`
- `AZURE_BACKEND_PUBLISH_PROFILE`
- `AZURE_FRONTEND_PUBLISH_PROFILE`
- `VITE_API_BASE_URL`

## 5. Local Reference
The `docker-compose.yml` in the root directory can be used to simulate the production architecture locally:
```bash
docker-compose up --build
```
