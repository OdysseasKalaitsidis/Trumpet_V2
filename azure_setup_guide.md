# Azure Setup Guide: Trumpet Digital Archive

This guide provides step-by-step instructions for setting up the necessary Azure infrastructure for the Trumpet project.

## 1. Resource Group & Storage

First, create a resource group and a storage account for your media and database.

```bash
# Create Resource Group
az group create --name TrumpetResourceGroup --location eastus

# Create Storage Account
az storage account create \
  --name trumpetstorage123 \
  --resource-group TrumpetResourceGroup \
  --location eastus \
  --sku Standard_LRS
```

### Create Containers & File Shares
1.  **Blob Container**: For media files.
    ```bash
    az storage container create --name media --account-name trumpetstorage123
    ```
2.  **File Share**: For the SQLite database persistence.
    ```bash
    az storage share create --name database-share --account-name trumpetstorage123
    ```

## 2. Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group TrumpetResourceGroup \
  --name trumpetregistry \
  --sku Basic \
  --admin-enabled true

# Get Login Server & Credentials (for GitHub Secrets)
az acr show --name trumpetregistry --query loginServer --output tsv
az acr credential show --name trumpetregistry --query "username" --output tsv
az acr credential show --name trumpetregistry --query "passwords[0].value" --output tsv
```

## 3. App Services (Web App for Containers)

### Backend (FastAPI)
```bash
az appservice plan create --name TrumpetAppPlan --resource-group TrumpetResourceGroup --is-linux --sku B1

az webapp create \
  --resource-group TrumpetResourceGroup \
  --plan TrumpetAppPlan \
  --name trumpet-backend-app \
  --deployment-container-image-name trumpetregistry.azurecr.io/trumpet-backend:latest
```

### Frontend (React/Vite)
```bash
az webapp create \
  --resource-group TrumpetResourceGroup \
  --plan TrumpetAppPlan \
  --name trumpet-frontend-app \
  --deployment-container-image-name trumpetregistry.azurecr.io/trumpet-frontend:latest
```

## 4. Persistent Storage for SQLite

To prevent losing your data on every deployment, you must mount the Azure File Share to the backend.

1.  In the Azure Portal, navigate to **trumpet-backend-app** -> **Configuration** -> **Path mappings**.
2.  Add a **New Azure Storage Mount**:
    *   **Name**: `db-volume`
    *   **Storage type**: `Azure Files`
    *   **Account**: `trumpetstorage123`
    *   **Share name**: `database-share`
    *   **Mount path**: `/data`
3.  Set the Environment Variable `DATABASE_URL` to `sqlite:////data/trumpet.db`.

## 5. GitHub Secrets Configuration

Add the following secrets to your GitHub repository to enable CI/CD:

| Secret Name | Value |
|-------------|-------|
| `ACR_LOGIN_SERVER` | `trumpetregistry.azurecr.io` |
| `ACR_USERNAME` | *From Step 2* |
| `ACR_PASSWORD` | *From Step 2* |
| `AZURE_BACKEND_APP_NAME` | `trumpet-backend-app` |
| `AZURE_FRONTEND_APP_NAME` | `trumpet-frontend-app` |
| `AZURE_BACKEND_PUBLISH_PROFILE` | *Download from Azure Portal (Backend App)* |
| `AZURE_FRONTEND_PUBLISH_PROFILE` | *Download from Azure Portal (Frontend App)* |
| `VITE_API_BASE_URL` | `https://trumpet-backend-app.azurewebsites.net` |
