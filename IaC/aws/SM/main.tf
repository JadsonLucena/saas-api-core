resource "aws_secretsmanager_secret" "secret" {
  name                    = local.final_secret_name
  recovery_window_in_days = var.RECOVERY_WINDOW_IN_DAYS

  tags                    = var.TAGS
}

resource "aws_secretsmanager_secret_version" "secret_version" {
  secret_id     = aws_secretsmanager_secret.secret.id
  secret_string = var.SECRET_VALUE

  depends_on = [aws_secretsmanager_secret.secret]
}

resource "random_id" "secret_suffix" {
  byte_length = 4
}

locals {
  default_secret_name = "test-secret-${random_id.secret_suffix.hex}"
  final_secret_name   = var.SECRET_NAME != "" ? var.SECRET_NAME : local.default_secret_name
}