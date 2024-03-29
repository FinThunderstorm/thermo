output "bucket_id" {
  value       = aws_s3_bucket.app.id
  sensitive   = true
  description = "S3 Bucket ID used for hosting the application"
}

output "aws_region" {
  value       = var.aws_region
  sensitive   = true
  description = "Used AWS Region"
}

output "auth_user_pool_app_client_id" {
  value       = aws_cognito_user_pool_client.thermo.id
  sensitive   = true
  description = "User Pool App Client Id used in frontend authentication"
}

