provider "azurerm" {
  features {}
  subscription_id                 = var.AZURE_SUBSCRIPTION_ID
  resource_provider_registrations = "none"
}

data "azurerm_client_config" "current_client" {}

module "secrets_manager" {
  source = "./SM"

  AZURE_RESOURCE_GROUP_NAME = var.AZURE_RESOURCE_GROUP_NAME
  AZURE_LOCATION            = var.AZURE_LOCATION
  CLIENT_ID                 = data.azurerm_client_config.current_client.client_id
  TENANT_ID                 = data.azurerm_client_config.current_client.tenant_id
  OBJECT_ID                 = data.azurerm_client_config.current_client.object_id
  PURGE_KEY_VAULT           = var.PURGE_KEY_VAULT
}