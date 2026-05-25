#!/usr/bin/env pwsh
# -----------------------------------------------------------------------------
# Trumpet - Azure One-Shot Provisioning Script
# Run this ONCE to set up all Azure resources.
# Usage: ./scripts/provision-azure.ps1
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

# -- Config - edit these before running ---------------------------------------
$RESOURCE_GROUP   = "trumpet-prod-rg"
$LOCATION         = "westeurope"
$ACR_NAME         = "trumpetacrprod"       # globally unique, alphanumeric only
$MYSQL_ADMIN      = "trumpetadmin"         # used inside the container
$STORAGE_ACCOUNT  = "trumpetstorageprod"   # globally unique, max 24 chars, lowercase (for Azure Files)
$CONTAINER_APP    = "trumpet-prod-web"
$ENV_NAME         = "trumpet-prod-env"
$KV_NAME          = "trumpet-kv-inf2023067" # globally unique Key Vault name

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
Write-Host "`n[1/10] Checking Azure login status..." -ForegroundColor Yellow

$IS_LOGGED_IN = $false
try {
    # Check if we are already authenticated by trying to get the account info
    $ACCOUNT_INFO = (az account show --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -eq 0 -and $ACCOUNT_INFO) {
        $IS_LOGGED_IN = $true
    }
} catch {
    $IS_LOGGED_IN = $false
}

if ($IS_LOGGED_IN) {
    Write-Host "Already logged in to Azure." -ForegroundColor Green
} else {
    Write-Host "Not logged in or session expired. Initiating login..." -ForegroundColor Yellow
    # Run az login but don't strictly crash on non-zero exit code since MFA on secondary tenants can trigger warnings/failures
    az login
    
    # Wait for the login to complete and then verify if we actually have an active subscription
    $ACCOUNT_INFO = (az account show --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $ACCOUNT_INFO) {
        Write-Error "Azure login failed. No active subscription found. Please make sure you are logged in."
        exit 1
    }
}

$SUBSCRIPTION_ID = (az account show --query "id" -o tsv)
Write-Host "OK Logged in. Subscription: $SUBSCRIPTION_ID" -ForegroundColor Green

Write-Host "   Registering Microsoft.DBforMySQL namespace in the subscription..." -ForegroundColor DarkYellow
az provider register --namespace Microsoft.DBforMySQL

Write-Host "   Waiting for Microsoft.DBforMySQL registration to complete (this may take a minute)..." -ForegroundColor DarkYellow
$TIMEOUT = 60  # 5 minutes maximum
$ELAPSED = 0
$REGISTERED = $false

while ($ELAPSED -lt $TIMEOUT) {
    $STATE = (az provider show -n Microsoft.DBforMySQL --query "registrationState" -o tsv 2>$null)
    if ($STATE -eq "Registered") {
        Write-Host "   Microsoft.DBforMySQL is successfully Registered!" -ForegroundColor Green
        $REGISTERED = $true
        break
    }
    Write-Host "   Registration state: $STATE. Waiting 5 seconds..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 5
    $ELAPSED += 1
}

if (-not $REGISTERED) {
    Write-Host "   [NOTE] Provider registration is taking longer than expected. Continuing deployment, but MySQL creation may fail if registration is not finished." -ForegroundColor Yellow
}

# -- Step 2: Create Resource Group --------------------------------------------
Write-Host "`n[2/10] Verifying Resource Group..." -ForegroundColor Yellow
$RG_EXISTS = (az group exists --name $RESOURCE_GROUP)
if ($RG_EXISTS -eq "true") {
    $RG_LOCATION = (az group show --name $RESOURCE_GROUP --query "location" -o tsv)
    Write-Host "OK Resource Group $RESOURCE_GROUP already exists in location: $RG_LOCATION" -ForegroundColor Green
} else {
    Write-Host "Creating Resource Group: $RESOURCE_GROUP in location: $LOCATION..." -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION
    if ($LASTEXITCODE -ne 0) { Write-Error "Resource Group creation failed."; exit 1 }
    $RG_LOCATION = $LOCATION
    Write-Host "OK Resource Group created." -ForegroundColor Green
}

# -- Step 3: Create Azure Container Registry -----------------------------------
Write-Host "`n[3/10] Verifying Container Registry..." -ForegroundColor Yellow
$ACR_EXISTS = $false
try {
    $ACR_ID = (az acr show --name $ACR_NAME --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -eq 0 -and $ACR_ID) {
        $ACR_EXISTS = $true
    }
} catch {
    $ACR_EXISTS = $false
}
if ($ACR_EXISTS) {
    Write-Host "OK Container Registry $ACR_NAME already exists." -ForegroundColor Green
} else {
    Write-Host "Creating Container Registry: $ACR_NAME..." -ForegroundColor Yellow
    az acr create `
        --resource-group $RESOURCE_GROUP `
        --name $ACR_NAME `
        --sku Basic `
        --admin-enabled true
    if ($LASTEXITCODE -ne 0) { Write-Error "Container Registry creation failed."; exit 1 }
    Write-Host "OK Container Registry created." -ForegroundColor Green
}
$ACR_SERVER   = (az acr show --name $ACR_NAME --query "loginServer" -o tsv)
$ACR_PASSWORD = (az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# -- Step 4: Create Azure Storage Account + File Share (for MySQL data persistence) --
Write-Host "`n[4/10] Verifying Storage Account for MySQL data persistence..." -ForegroundColor Yellow
$SA_EXISTS = $false
try {
    $SA_ID = (az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -eq 0 -and $SA_ID) { $SA_EXISTS = $true }
} catch { $SA_EXISTS = $false }

if ($SA_EXISTS) {
    Write-Host "OK Storage Account $STORAGE_ACCOUNT already exists." -ForegroundColor Green
} else {
    Write-Host "Creating Storage Account: $STORAGE_ACCOUNT..." -ForegroundColor Yellow
    az storage account create `
        --name $STORAGE_ACCOUNT `
        --resource-group $RESOURCE_GROUP `
        --location $RG_LOCATION `
        --sku Standard_LRS `
        --kind StorageV2
    if ($LASTEXITCODE -ne 0) { Write-Error "Storage Account creation failed."; exit 1 }
    Write-Host "OK Storage Account created." -ForegroundColor Green
}

$STORAGE_KEY = (az storage account keys list `
    --resource-group $RESOURCE_GROUP `
    --account-name $STORAGE_ACCOUNT `
    --query "[0].value" -o tsv)

# Create the file share for MySQL data (if not already present)
$SHARE_EXISTS = (az storage share exists `
    --name "mysql-data" `
    --account-name $STORAGE_ACCOUNT `
    --account-key $STORAGE_KEY `
    --query "exists" -o tsv 2>$null)
if ($SHARE_EXISTS -ne "true") {
    Write-Host "   Creating Azure File Share 'mysql-data'..." -ForegroundColor DarkYellow
    az storage share create `
        --name "mysql-data" `
        --account-name $STORAGE_ACCOUNT `
        --account-key $STORAGE_KEY `
        --quota 5
    if ($LASTEXITCODE -ne 0) { Write-Error "File Share creation failed."; exit 1 }
    Write-Host "OK File Share created." -ForegroundColor Green
} else {
    Write-Host "OK File Share 'mysql-data' already exists." -ForegroundColor Green
}

# -- Step 5: MySQL runs INSIDE the container (no external DB service needed) --
Write-Host "`n[5/10] MySQL is bundled inside the Docker container." -ForegroundColor Yellow
Write-Host "   DB will be initialised automatically on first container boot." -ForegroundColor DarkYellow
Write-Host "OK No external DB service required." -ForegroundColor Green

# -- Step 6: DB import is handled by the container entrypoint on first boot ---
Write-Host "`n[6/10] Database import will run inside the container on first boot." -ForegroundColor Yellow
Write-Host "   The entrypoint script imports dump.sql automatically." -ForegroundColor DarkYellow
Write-Host "OK Nothing to do here." -ForegroundColor Green

# -- Step 7: Create Key Vault + store secrets ----------------------------------
Write-Host "`n[7/10] Verifying Key Vault..." -ForegroundColor Yellow
$KV_EXISTS = $false
try {
    $KV_ID = (az keyvault show --name $KV_NAME --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -eq 0 -and $KV_ID) {
        $KV_EXISTS = $true
    }
} catch {
    $KV_EXISTS = $false
}
if ($KV_EXISTS) {
    Write-Host "OK Key Vault $KV_NAME already exists." -ForegroundColor Green
} else {
    Write-Host "Creating Key Vault: $KV_NAME..." -ForegroundColor Yellow
    az keyvault create `
        --name $KV_NAME `
        --resource-group $RESOURCE_GROUP `
        --location $RG_LOCATION `
        --enable-rbac-authorization false
    if ($LASTEXITCODE -ne 0) { Write-Error "Key Vault creation failed."; exit 1 }
    Write-Host "OK Key Vault created." -ForegroundColor Green
}

az keyvault secret set --vault-name $KV_NAME --name "mysql-admin-password" --value $MYSQL_PASS_PLAIN
az keyvault secret set --vault-name $KV_NAME --name "api-key" --value $API_KEY_PLAIN
Write-Host "OK Secrets stored in Key Vault." -ForegroundColor Green

# -- Step 8: Build & push Docker image (LOCAL BUILD - Azure Student subscription compatibility) ----
Write-Host "`n[8/10] Building Docker image locally and pushing to ACR..." -ForegroundColor Yellow

# Verify if docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker CLI is not installed or not in the PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop and ensure it is running." -ForegroundColor Yellow
    exit 1
}

Write-Host "   Verifying if Docker daemon is running..." -ForegroundColor DarkYellow
docker info > $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker daemon is not running." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try running this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "   Authenticating Docker with ACR..." -ForegroundColor DarkYellow
az acr login --name $ACR_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to authenticate Docker with ACR registry $ACR_NAME." -ForegroundColor Red
    exit 1
}

Write-Host "   Building Docker image locally (this may take a few minutes)..." -ForegroundColor DarkYellow
docker build -t "$ACR_SERVER/trumpet:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "   Pushing Docker image to ACR..." -ForegroundColor DarkYellow
docker push "$ACR_SERVER/trumpet:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push image to ACR." -ForegroundColor Red
    exit 1
}

Write-Host "OK Image built and stored in ACR." -ForegroundColor Green

# -- Step 9: Create Container Apps Environment + App --------------------------
Write-Host "`n[9/10] Verifying Container Apps Environment..." -ForegroundColor Yellow
$ENV_EXISTS = $false
try {
    $ENV_ID = (az containerapp env show --name $ENV_NAME --resource-group $RESOURCE_GROUP --query "id" -o tsv 2>$null)
    if ($LASTEXITCODE -eq 0 -and $ENV_ID) {
        $ENV_EXISTS = $true
    }
} catch {
    $ENV_EXISTS = $false
}
if ($ENV_EXISTS) {
    Write-Host "OK Container Apps Environment $ENV_NAME already exists." -ForegroundColor Green
} else {
    Write-Host "Creating Container Apps Environment: $ENV_NAME..." -ForegroundColor Yellow
    az containerapp env create `
        --name $ENV_NAME `
        --resource-group $RESOURCE_GROUP `
        --location $RG_LOCATION
    if ($LASTEXITCODE -ne 0) { Write-Error "Container Apps Environment creation failed."; exit 1 }
    Write-Host "OK Container Apps Environment created." -ForegroundColor Green
}

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
    --min-replicas 1 `
    --max-replicas 1 `
    --cpu 1.0 `
    --memory 2.0Gi `
    --env-vars `
        "DB_HOST=127.0.0.1" `
        "DB_PORT=3306" `
        "DB_NAME=trumpet" `
        "DB_USER=$MYSQL_ADMIN" `
        "DB_PASS=secretref:mysql-pass" `
        "RESOURCES_PATH=/var/www/trumpet/resources" `
        "API_KEY=secretref:api-key" `
        "PYTHON_BIN=/var/www/trumpet/python_services/venv/bin/python3" `
        "PYTHON_SERVICES_PATH=/var/www/trumpet/python_services" `
    --secrets `
        "mysql-pass=$MYSQL_PASS_PLAIN" `
        "api-key=$API_KEY_PLAIN"
if ($LASTEXITCODE -ne 0) { Write-Error "Container App creation failed."; exit 1 }

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
Write-Host "MySQL:           Bundled inside container (data on Azure Files: $STORAGE_ACCOUNT/mysql-data)"
Write-Host "Media:           Served locally from container /resources (no blob storage)"
Write-Host "Key Vault:       $KV_NAME"
Write-Host ""
Write-Host "IMPORTANT - Add this secret to GitHub:" -ForegroundColor Yellow
Write-Host "   Settings -> Secrets -> AZURE_CREDENTIALS" -ForegroundColor Yellow
Write-Host ""
Write-Host $SP_JSON -ForegroundColor DarkGray
Write-Host "=======================================================" -ForegroundColor Cyan
