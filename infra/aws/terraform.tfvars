// Example Terraform variables for infra/aws
// Copy this file to terraform.tfvars and update values before running terraform

aws_region = "us-east-1"
ecr_repo_backend = "denuel-auto-backend"
ecr_repo_frontend = "denuel-auto-frontend"
cluster_name = "denuel-auto-cluster"

# VPC / networking
vpc_id = "vpc-xxxxxxxx"
subnet_ids = ["subnet-xxxxxxxx", "subnet-yyyyyyyy"]
security_group_ids = ["sg-xxxxxxxx"]

# Optional ALB & DNS
use_alb = true
domain_name = "example.com" # set your public domain
hosted_zone_id = "ZABCDEFG123456" # Route53 hosted zone ID
# certificate_arn = "arn:aws:acm:..." # optional: provide if you already have cert

# ECR images (if you want to have infra reference image at creation time)
backend_image = "123456789012.dkr.ecr.us-east-1.amazonaws.com/denuel-auto-backend:latest"
frontend_image = "123456789012.dkr.ecr.us-east-1.amazonaws.com/denuel-auto-frontend:latest"

// Task settings
container_backend_name = "web"
container_frontend_name = "frontend"
backend_cpu = "256"
backend_memory = "512"
frontend_cpu = "256"
frontend_memory = "512"
backend_desired_count = 1
frontend_desired_count = 1
