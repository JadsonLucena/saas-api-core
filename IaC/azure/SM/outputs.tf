output "key_vault_name" {
  value = azurerm_key_vault.kv.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.kv.vault_uri
}

output "secret_id" {
  value = azurerm_key_vault_secret.secret.id
}

output "secret_version" {
  value = azurerm_key_vault_secret.secret.version
}