resource "google_secret_manager_secret" "secret" {
  secret_id = local.final_secret_name
  replication {
    auto {}
  }

  labels = var.TAGS
}

resource "google_secret_manager_secret_version" "secret_version" {
  secret      = google_secret_manager_secret.secret.id
  secret_data_wo = var.SECRET_VALUE

  depends_on = [google_secret_manager_secret.secret]
}

resource "random_id" "secret_suffix" {
  byte_length = 4
}

locals {
  default_secret_name = "test-secret-${random_id.secret_suffix.hex}"
  final_secret_name   = var.SECRET_NAME != "" ? var.SECRET_NAME : local.default_secret_name
}