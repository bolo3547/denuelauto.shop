variable "aws_region" {
  description = "AWS region to use"
  type        = string
  default     = "us-east-1"
}

variable "use_alb" {
  description = "Whether to provision an Application Load Balancer (ALB) and listeners"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Optional domain name for ALB (example.com)"
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Optional Route53 hosted zone ID (for DNS validation and record creation)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "If provided, uses this ACM certificate ARN for the ALB listener. If empty and domain_name is set, a certificate can be requested with DNS validation." 
  type        = string
  default     = ""
}

variable "ecr_repo_backend" {
  description = "ECR repo name for backend image"
  type        = string
  default     = "denuel-auto-backend"
}

variable "ecr_repo_frontend" {
  description = "ECR repo name for frontend image"
  type        = string
  default     = "denuel-auto-frontend"
}

variable "cluster_name" {
  description = "Name of ECS cluster"
  type        = string
  default     = "denuel-auto-cluster"
}

variable "subnet_ids" {
  description = "List of subnet IDs for ECS tasks"
  type        = list(string)
  default     = []
}

variable "vpc_id" {
  description = "VPC ID where ECS tasks and ALB will be provisioned"
  type        = string
  default     = ""
}

variable "security_group_ids" {
  description = "List of security group IDs for ECS tasks"
  type        = list(string)
  default     = []
}

variable "backend_image" {
  description = "Full image URI for backend container (e.g., 123456.dkr.ecr.us-east-1.amazonaws.com/denuel-auto-backend:sha)"
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Full image URI for frontend container"
  type        = string
  default     = ""
}

variable "container_backend_name" {
  description = "Backend container name used in task definition"
  type        = string
  default     = "web"
}

variable "container_frontend_name" {
  description = "Frontend container name used in task definition"
  type        = string
  default     = "frontend"
}

variable "backend_container_port" {
  description = "Container port for backend"
  type        = number
  default     = 4000
}

variable "frontend_container_port" {
  description = "Container port for frontend"
  type        = number
  default     = 3000
}

variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = string
  default     = "256"
}

variable "backend_memory" {
  description = "Memory in MB for backend task"
  type        = string
  default     = "512"
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = string
  default     = "256"
}

variable "frontend_memory" {
  description = "Memory in MB for frontend task"
  type        = string
  default     = "512"
}

variable "backend_desired_count" {
  type    = number
  default = 1
}

variable "frontend_desired_count" {
  type    = number
  default = 1
}

