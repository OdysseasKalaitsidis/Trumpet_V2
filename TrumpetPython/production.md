# Production Deployment Guide: Trumpet Python Backend

This document provides detailed guidance on deploying and managing the **Trumpet Python (FastAPI)** backend in an Azure production environment.

## 1. Prerequisites
- **Azure Account**: Subscription with permissions to create App Services/Container Apps.
- **Docker**: For building and pushing the container image.
- **Azure CLI**: Logged in via `az login`.

## 2. Environment Configuration
The backend uses **Pydantic Settings** to manage configuration. In Azure, these should be set as **App Settings** (Configuration) rather than a `.env` file.

| variable | description | recommended production value |
|----------|-------------|-----------------------------|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///../data/database/trumpet.db` (for simple setups) |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage Key | *Your Azure Portal Connection String* |
| `AZURE_CONTAINER_NAME` | Blob container for media | `media` |
| `ALLOWED_ORIGINS` | CORS allowed domains | `https://your-frontend.azurewebsites.net` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

> [!IMPORTANT]
> Never commit your actual connection strings to version control. Always use Azure's secure environment variable storage.

## 3. Deployment Steps (Containerized)

We recommend using **Azure Container Apps** or **Azure App Service (Web App for Containers)**.

### Step 3.1: Build and Push to Azure Container Registry (ACR)
```bash
# Login to ACR
az acr login --name <your_registry_name>

# Build the production image
docker build -t <your_registry_name>.azurecr.io/trumpet-backend:latest ./TrumpetPython

# Push to Azure
docker push <your_registry_name>.azurecr.io/trumpet-backend:latest
```

### 3.3 Persistent Storage for SQLite
By default, files inside a container are ephemeral. To persist your database:
1.  **Mount Azure Files**: Map a share to `/data` in your App Service.
2.  **Environment Variable**: Set `DATABASE_URL=sqlite:////data/trumpet.db`.
3.  **Permissions**: Ensure the `/data` directory is writable by the container user.

---

## 4. Media Migration to Azure Blob Storage
To move your existing local assets to the cloud, use the provided migration script:

1.  Ensure your `.env` contains the correct `AZURE_STORAGE_CONNECTION_STRING`.
2.  Run the script:
    ```bash
    python TrumpetPython/scripts/migrate_to_blob.py
    ```

> [!TIP]
> The `/media` endpoint in the API handles the redirection automatically. Once your files are in Blob Storage, the backend will generate secure **SAS URLs** with 1-hour expiry for every request.

---

## 5. Monitoring & Performance

### 5.1 Gunicorn Scaling
The `Dockerfile` is pre-configured with `gunicorn` and `4` worker processes. 
- For higher traffic, increase the worker count (`-w` flag in Dockerfile) or scale the Azure App Service horizontally.

---

## 6. Health Checks
The `/health` endpoint returns:
- `200 OK` when the app is initialized.
- Use this in Azure's **Health Check** settings to ensure automatic instance restarts if the app becomes unresponsive.

---

## 6. Security Considerations
- **CORS**: Ensure `ALLOWED_ORIGINS` is strictly limited to your frontend domain.
- **SSL**: Azure App Service provides a default SSL certificate. Always use `https` for API calls.
- **SAS Tokens**: The app generates time-limited SAS tokens for media access. Even if a URL is leaked, it will expire automatically.

## 7. Troubleshooting
- **404 on Media**: Check if the file exists in the Azure Blob container with the exact path (e.g., `collection_id/items/...`).
- **Connection Errors**: Ensure Azure Storage firewall allows access from your App Service (if using a VNet).
- **Startup Failures**: Check logs for missing environment variables.
