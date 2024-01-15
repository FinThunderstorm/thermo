output "auth_endpoint" {
  value       = aws_cognito_user_pool.endpoint
  sensitive   = true
  description = "User authentication endpoint for frontend"
}

output "auth_user_pool_id" {
  value       = aws_cognito_user_pool.thermo.id
  sensitive   = true
  description = "User Pool Id used in frontend authentication"
}

output "auth_user_pool_app_client_id" {
  value       = aws_cognito_user_pool_client.thermo.id
  sensitive   = true
  description = "User Pool App Client Id used in frontend authentication"
}