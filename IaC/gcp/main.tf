provider "google" {
  project = var.GOOGLE_CLOUD_PROJECT
  region  = var.GOOGLE_CLOUD_LOCATION
}

module "secrets_manager" {
  source = "./SM"
}