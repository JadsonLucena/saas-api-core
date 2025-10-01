output "secret_id" {
  value = aws_secretsmanager_secret.secret.id
}

output "secret_arn" {
  value = aws_secretsmanager_secret.secret.arn
}

output "secret_version" {
  value = aws_secretsmanager_secret_version.secret_version
}