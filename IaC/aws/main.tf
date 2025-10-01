provider "aws" {
  region = "us-east-1"
}

module "secrets_manager" {
  source = "./SM"

  RECOVERY_WINDOW_IN_DAYS = var.RECOVERY_WINDOW_IN_DAYS
}