// ─────────────────────────────────────────────────────────────────────────────
// Trumpet — Azure Infrastructure as Code (Bicep)
// Provisions: ACR, Container Apps, MySQL Flexible Server, Storage, Key Vault
// ─────────────────────────────────────────────────────────────────────────────

@description('Azure region for all resources')
param location string = 'westeurope'

@description('Short environment tag (used in resource names)')
param environment string = 'prod'

@description('MySQL admin username')
param mysqlAdminUser string = 'trumpetadmin'

@description('MySQL admin password — injected at deploy time, never stored in code')
@secure()
param mysqlAdminPassword string

@description('Backend API key')
@secure()
param apiKey string

// ── Naming convention ─────────────────────────────────────────────────────────
var prefix = 'trumpet-${environment}'
var acrName = 'trumpetacr${environment}' // ACR names: alphanumeric only, globally unique
var mysqlServerName = '${prefix}-mysql'
// Storage: not used — media is served from the container's local /resources path

// ── Azure Container Registry ──────────────────────────────────────────────────
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}


// ── Azure Database for MySQL Flexible Server ──────────────────────────────────
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-30' = {
  name: mysqlServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: mysqlAdminUser
    administratorLoginPassword: mysqlAdminPassword
    version: '8.0.21'
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    storage: {
      storageSizeGB: 20
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-30' = {
  parent: mysqlServer
  name: 'trumpet'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

// Allow Azure services to connect (needed for Container Apps)
resource mysqlFirewallAllowAzure 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-06-30' = {
  parent: mysqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ── Azure Key Vault ───────────────────────────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${prefix}-kv'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    softDeleteRetentionInDays: 7
  }
}

resource kvSecretMysqlPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'mysql-admin-password'
  properties: {
    value: mysqlAdminPassword
  }
}

resource kvSecretApiKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'api-key'
  properties: {
    value: apiKey
  }
}

// Storage connection string secret: removed (no blob storage)

// ── Container Apps Environment ────────────────────────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${prefix}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ── Container App (Trumpet Web) ───────────────────────────────────────────────
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${prefix}-web'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'trumpet-web'
          image: '${acr.properties.loginServer}/trumpet:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'DB_HOST', value: '${mysqlServer.properties.fullyQualifiedDomainName}' }
            { name: 'DB_PORT', value: '3306' }
            { name: 'DB_NAME', value: 'trumpet' }
            { name: 'DB_USER', value: mysqlAdminUser }
            { name: 'DB_PASS', secretRef: 'acr-password' } // will be replaced with KV ref after deploy
            { name: 'PYTHON_BIN', value: '/var/www/trumpet/python_services/venv/bin/python3' }
            { name: 'PYTHON_SERVICES_PATH', value: '/var/www/trumpet/python_services' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '20'
              }
            }
          }
        ]
      }
    }
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output acrLoginServer string = acr.properties.loginServer
output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output mysqlHost string = mysqlServer.properties.fullyQualifiedDomainName
// output storageAccountName: removed (no blob storage)
output keyVaultName string = keyVault.name
