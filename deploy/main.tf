terraform {
  required_version = ">= 1.0.11"
  backend "s3" {
    bucket         = "alanendev-terraform-state"
    key            = "thermo-ci-deploy.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "alanendev-terraform-locks"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.32.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
