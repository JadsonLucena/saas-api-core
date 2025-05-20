variable "AZURE_RESOURCE_GROUP_NAME" {}
variable "AZURE_LOCATION" {}
variable "CLIENT_ID" {}
variable "TENANT_ID" {}
variable "OBJECT_ID" {}
variable "PURGE_KEY_VAULT" {}

variable "AZURE_KV_NAME" {
  type    = string
  default = "api-core-test-kv"
}

variable "SOFT_DELETE_RETENTION_DAYS" {
  type    = number
  default = 7
}

variable "SKU_NAME" {
  type    = string
  default = "standard"
}

variable "SECRET_NAME" {
  type    = string
  default = ""
}

variable "SECRET_VALUE" {
  type    = string
  default = "{\"API_KEY\": \"test-api-key-aws\"}"
}

variable "TAGS" {
  description = "Tags to apply to the secret"
  type        = map(string)
  default     = {
    foo = "bar"
  }
}