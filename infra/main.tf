terraform {
  required_version = ">= 1.0.11"
  backend "s3" {
    bucket         = "alanendev-terraform-state"
    key            = "thermo-ci.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "alanendev-terraform-locks"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.32.1"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.22.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "acm"
  region = "us-east-1"
}

provider "cloudflare" {
}

resource "aws_s3_bucket" "app" {
  bucket = "thermo-alanendev-bucket"
  tags = {
    Environment = "production"
    Name        = "thermo-alanendev-bucket"
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "thermo-alanendev-logs-bucket"
  tags = {
    Environment = "production"
    Name        = "thermo-cf-logs"
  }
}

resource "aws_s3_bucket_ownership_controls" "app" {
  bucket = aws_s3_bucket.app.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "app" {
  depends_on = [aws_s3_bucket_ownership_controls.app]

  bucket = aws_s3_bucket.app.id
  acl    = "private"
}

resource "aws_s3_bucket_acl" "logs" {
  depends_on = [aws_s3_bucket_ownership_controls.logs]

  bucket = aws_s3_bucket.logs.id
  acl    = "private"
}

resource "aws_s3_bucket_website_configuration" "app_website_conf" {
  bucket = aws_s3_bucket.app.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_versioning" "app_versioning" {
  bucket = aws_s3_bucket.app.id
  versioning_configuration {
    status = "Enabled"
  }
}

locals {
  s3_origin_id = "thermo-alanendev-bucket-origin-id"
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = var.domain_name
}

resource "aws_cloudfront_distribution" "app" {
  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "thermo-alanendev"
  default_root_object = "index.html"

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.logs.bucket_domain_name
    prefix          = "thermo-alanendev-cf"
  }

  aliases = [var.domain_name]

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "blacklist"
      locations        = ["RU", "CN"]
    }
  }

  tags = {
    Environment = "production"
    Name        = "thermo-alanendev-cf"
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.alanendev.arn
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2018"
    ssl_support_method             = "sni-only"
  }
}
