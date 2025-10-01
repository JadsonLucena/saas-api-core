variable "RECOVERY_WINDOW_IN_DAYS" {}

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