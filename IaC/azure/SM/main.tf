resource "azurerm_key_vault" "kv" {
  name                       = var.AZURE_KV_NAME
  location                   = var.AZURE_LOCATION
  resource_group_name        = var.AZURE_RESOURCE_GROUP_NAME
  tenant_id                  = var.TENANT_ID
  soft_delete_retention_days = var.SOFT_DELETE_RETENTION_DAYS
  sku_name                   = var.SKU_NAME
}

resource "azurerm_key_vault_access_policy" "kv_access_policy" {
  key_vault_id = azurerm_key_vault.kv.id

  tenant_id = var.TENANT_ID
  object_id = var.OBJECT_ID

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Purge",
    "Delete"
  ]

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "secret" {
  name         = local.final_secret_name
  value        = var.SECRET_VALUE
  key_vault_id = azurerm_key_vault.kv.id

  tags = var.TAGS

  depends_on = [azurerm_key_vault_access_policy.kv_access_policy]
}

resource "null_resource" "purge_kv" {
  count = var.PURGE_KEY_VAULT ? 1 : 0

  triggers = {
    kv_name    = var.AZURE_KV_NAME
    kv_region  = var.AZURE_LOCATION
  }

  provisioner "local-exec" {
    when    = destroy
    command = "az keyvault purge --name ${self.triggers.kv_name} --location ${self.triggers.kv_region}"
  }

  depends_on = [azurerm_key_vault.kv]
}

resource "random_id" "secret_suffix" {
  byte_length = 4
}

locals {
  default_secret_name = "test-secret-${random_id.secret_suffix.hex}"
  final_secret_name   = var.SECRET_NAME != "" ? var.SECRET_NAME : local.default_secret_name
}
