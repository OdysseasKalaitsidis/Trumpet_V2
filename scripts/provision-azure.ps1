#!/usr/bin/env pwsh
# -----------------------------------------------------------------------------
# Trumpet - Azure One-Shot Provisioning Script
# Run this ONCE to set up all Azure resources.
# Usage: ./scripts/provision-azure.ps1
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

# -- Config - edit these before running ---------------------------------------
$RESOURCE_GROUP   = "trumpet-prod-rg"
$LOCATION         = "northeurope"
$ACR_NAME         = "trumpetacrprod"       # globally unique, alphanumeric only
$MYSQL_SERVER     = "trumpet-prod-mysql"
$MYSQL_ADMIN      = "trumpetadmin"
$MYSQL_DB         = "trumpet"
$STORAGE_ACCOUNT  = "trumpetstorageprod"   # globally unique, max 24 chars, lowercase
$CONTAINER_APP    = "trumpet-prod-web"
$ENV_NAME         = "trumpet-prod-env"
$KV_NAME          = "trumpet-prod-kv"
$DUMP_FILE        = ".\database\dump.sql"

Write-Host "Trumpet Azure Provisioning" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# -- Step 0: Prompt for secrets (never stored in code) ------------------------
$MYSQL_PASSWORD = Read-Host "Enter MySQL admin password (min 8 chars, must include upper, lower, number, special)" -AsSecureString
$MYSQL_PASS_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($MYSQL_PASSWORD))

$API_KEY = Read-Host "Enter API key for the backend" -AsSecureString
$API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($API_KEY))

# -- Step 1: Login & select subscription --------------------------------------
Write-Host "`n[1/10] Logging in to Azure..." -ForegroundColor Yellow
az login
$SUBSCRIPTION_ID = (az account show --query "id" -o tsv)
Write-Host "OK Logged in. Subscription: $SUBSCRIPTION_ID" -ForegroundColor Green

# -- Step 2: Create Resource Group --------------------------------------------
Write-Host "`n[2/10] Creating Resource Group: $RESOURCE_GROUP..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION
Write-Host "OK Resource Group created." -ForegroundColor Green

# -- Step 3: Create Azure Container Registry -----------------------------------
Write-Host "`n[3/10] Creating Container Registry: $ACR_NAME..." -ForegroundColor Yellow
az acr create `
    --resource-group $RESOURCE_GROUP `
    --name $ACR_NAME `
    --sku Basic `
    --admin-enabled true
$ACR_SERVER = (az acr show --name $ACR_NAME --query "loginServer" -o tsv)
Write-Host "OK ACR created: $ACR_SERVER" -ForegroundColor Green

# -- Step 4: Create Storage Account + media container -------------------------
Write-Host "`n[4/10] Creating Storage Account: $STORAGE_ACCOUNT..." -ForegroundColor Yellow
az storage account create `
    --name $STORAGE_ACCOUNT `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION `
    --sku Standard_LRS `
    --kind StorageV2

az storage container create `
    --name "media" `
    --account-name $STORAGE_ACCOUNT `
    --public-access blob

$STORAGE_CONN = (az storage account show-connection-string `
    --name $STORAGE_ACCOUNT `
    --resource-group $RESOURCE_GROUP `
    --query "connectionString" -o tsv)
Write-Host "OK Storage Account + media container created." -ForegroundColor Green

# -- Step 5: Create MySQL Flexible Server -------------------------------------
Write-Host "`n[5/10] Creating MySQL Flexible Server: $MYSQL_SERVER..." -ForegroundColor Yellow
Write-Host "   (This takes ~5 minutes - please wait)" -ForegroundColor DarkYellow
az mysql flexible-server create `
    --resource-group $RESOURCE_GROUP `
    --name $MYSQL_SERVER `
    --location $LOCATION `
    --admin-user $MYSQL_ADMIN `
    --admin-password $MYSQL_PASS_PLAIN `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 8.0.21 `
    --storage-size 20 `
    --public-access 0.0.0.0

az mysql flexible-server db create `
    --resource-group $RESOURCE_GROUP `
    --server-name $MYSQL_SERVER `
    --database-name $MYSQL_DB

$MYSQL_HOST = (az mysql flexible-server show `
    --resource-group $RESOURCE_GROUP `
    --name $MYSQL_SERVER `
    --query "fullyQualifiedDomainName" -o tsv)
Write-Host "OK MySQL Server created: $MYSQL_HOST" -ForegroundColor Green

# -- Step 6: Import database dump ---------------------------------------------
Write-Host "`n[6/10] Importing database dump..." -ForegroundColor Yellow
Write-Host "   Using: $DUMP_FILE"
az mysql flexible-server execute `
    --name $MYSQL_SERVER `
    --resource-group $RESOURCE_GROUP `
    --admin-user $MYSQL_ADMIN `
    --admin-password $MYSQL_PASS_PLAIN `
    --database-name $MYSQL_DB `
    --file-path $DUMP_FILE
Write-Host "OK Database dump imported." -ForegroundColor Green

# -- Step 7: Create Key Vault + store secrets ----------------------------------
Write-Host "`n[7/10] Creating Key Vault: $KV_NAME..." -ForegroundColor Yellow
az keyvault create `
    --name $KV_NAME `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION `
    --enable-rbac-authorization false

az keyvault secret set --vault-name $KV_NAME --name "mysql-admin-password" --value $MYSQL_PASS_PLAIN
az keyvault secret set --vault-name $KV_NAME --name "api-key" --value $API_KEY_PLAIN
az keyvault secret set --vault-name $KV_NAME --name "storage-connection-string" --value $STORAGE_CONN
Write-Host "OK Key Vault created and secrets stored." -ForegroundColor Green

# -- Step 8: Build & push Docker image (CLOUD BUILD - No local Docker needed!) ----
Write-Host "`n[8/10] Building Docker image in the cloud (ACR Build)..." -ForegroundColor Yellow
az acr build --registry $ACR_NAME --image "trumpet:latest" .
Write-Host "OK Image built and stored in ACR." -ForegroundColor Green

# -- Step 9: Create Container Apps Environment + App --------------------------
Write-Host "`n[9/10] Creating Container Apps Environment and App..." -ForegroundColor Yellow
$ACR_PASSWORD = (az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

az containerapp env create `
    --name $ENV_NAME `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION

az containerapp create `
    --name $CONTAINER_APP `
    --resource-group $RESOURCE_GROUP `
    --environment $ENV_NAME `
    --image "$ACR_SERVER/trumpet:latest" `
    --registry-server $ACR_SERVER `
    --registry-username $ACR_NAME `
    --registry-password $ACR_PASSWORD `
    --target-port 80 `
    --ingress external `
    --min-replicas 0 `
    --max-replicas 3 `
    --cpu 0.5 `
    --memory 1.0Gi `
    --env-vars `
        "DB_HOST=$MYSQL_HOST" `
        "DB_PORT=3306" `
        "DB_NAME=$MYSQL_DB" `
        "DB_USER=$MYSQL_ADMIN" `
        "DB_PASS=secretref:mysql-pass" `
        "AZURE_STORAGE_CONNECTION_STRING=secretref:storage-conn" `
        "AZURE_CONTAINER_NAME=media" `
        "API_KEY=secretref:api-key" `
        "PYTHON_BIN=/var/www/trumpet/python_services/venv/bin/python3" `
        "PYTHON_SERVICES_PATH=/var/www/trumpet/python_services" `
    --secrets `
        "mysql-pass=$MYSQL_PASS_PLAIN" `
        "storage-conn=$STORAGE_CONN" `
        "api-key=$API_KEY_PLAIN"

Write-Host "OK Container App deployed." -ForegroundColor Green

# -- Step 10: Create GitHub Actions Service Principal -------------------------
Write-Host "`n[10/10] Creating GitHub Actions Service Principal..." -ForegroundColor Yellow
$SP_JSON = (az ad sp create-for-rbac `
    --name "trumpet-github-actions" `
    --role contributor `
    --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" `
    --sdk-auth)

Write-Host "OK Service Principal created." -ForegroundColor Green

# -- Print final summary ------------------------------------------------------
$LIVE_URL = (az containerapp show `
    --name $CONTAINER_APP `
    --resource-group $RESOURCE_GROUP `
    --query "properties.configuration.ingress.fqdn" -o tsv)

Write-Host "`n" 
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "TRUMPET IS LIVE ON AZURE!" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Live URL:        https://$LIVE_URL"
Write-Host "ACR:             $ACR_SERVER"
Write-Host "MySQL Host:      $MYSQL_HOST"
Write-Host "Storage:         $STORAGE_ACCOUNT"
Write-Host "Key Vault:       $KV_NAME"
Write-Host ""
Write-Host "IMPORTANT - Add this secret to GitHub:" -ForegroundColor Yellow
Write-Host "   Settings -> Secrets -> AZURE_CREDENTIALS" -ForegroundColor Yellow
Write-Host ""
Write-Host $SP_JSON -ForegroundColor DarkGray
Write-Host "=======================================================" -ForegroundColor Cyan
