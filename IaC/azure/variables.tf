variable "AZURE_RESOURCE_GROUP_NAME" {
  type = string
}

variable "AZURE_SUBSCRIPTION_ID" {
  type = string
}

variable "AZURE_LOCATION" {
  type    = string
  default = "East US"
}

variable "PURGE_KEY_VAULT" {
  description = "If true, performs the purge of the deleted Key Vault"
  type        = bool
  default     = false
}
