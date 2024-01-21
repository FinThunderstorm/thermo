resource "aws_cognito_user_pool" "thermo" {
  name                     = "thermo-auth"
  mfa_configuration        = "ON"
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 15
    require_lowercase = true
    require_uppercase = true
    require_symbols   = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  username_configuration {
    case_sensitive = false
  }

  user_pool_add_ons {
    advanced_security_mode = "ENFORCED"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }

  software_token_mfa_configuration {
    enabled = true
  }
}

resource "aws_cognito_user_pool_client" "thermo" {
  name                = "thermo-auth-client"
  user_pool_id        = aws_cognito_user_pool.thermo.id
  callback_urls       = ["https://${var.domain_name}/auth/callback"]
  explicit_auth_flows = ["USER_PASSWORD_AUTH"]
}
