terraform {
  required_providers {
    aws = { source = "hashicorp/aws" }
  }
  required_version = ">= 1.4.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "backend" {
  name = var.ecr_repo_backend
  image_scanning_configuration { scan_on_push = true }
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "frontend" {
  name = var.ecr_repo_frontend
  image_scanning_configuration { scan_on_push = true }
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecs_cluster" "denuel_cluster" {
  name = var.cluster_name
}

// Optional: ALB / HTTPS setup for domain
resource "aws_security_group" "alb" {
  count = var.use_alb ? 1 : 0
  name = "${var.cluster_name}-alb-sg"
  description = "Allow HTTP/HTTPS to ALB"
  vpc_id = var.vpc_id

  ingress {
    description = "HTTP"
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS"
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "dnl_alb" {
  count = var.use_alb ? 1 : 0
  name = "${var.cluster_name}-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.alb[0].id]
  subnets = var.subnet_ids
}

resource "aws_lb_target_group" "frontend" {
  count = var.use_alb ? 1 : 0
  name = "${var.cluster_name}-frontend-tg"
  port = var.frontend_container_port
  protocol = "HTTP"
  vpc_id = var.vpc_id
  health_check {
    path = "/api/health"
    protocol = "HTTP"
    matcher = "200"
    interval = 30
  }
}

resource "aws_lb_target_group" "backend" {
  count = var.use_alb ? 1 : 0
  name = "${var.cluster_name}-backend-tg"
  port = var.backend_container_port
  protocol = "HTTP"
  vpc_id = var.vpc_id
  health_check {
    path = "/api/health"
    protocol = "HTTP"
    matcher = "200"
    interval = 30
  }
}

// Certificate: we either use provided ARN or request one via ACM with DNS validation
resource "aws_acm_certificate" "cert" {
  count = var.use_alb && var.certificate_arn == "" && var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  domain_name = var.domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  count = var.use_alb && var.certificate_arn == "" && var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  name    = element(aws_acm_certificate.cert[0].domain_validation_options, 0).resource_record_name
  type    = element(aws_acm_certificate.cert[0].domain_validation_options, 0).resource_record_type
  zone_id = var.hosted_zone_id
  records = [element(aws_acm_certificate.cert[0].domain_validation_options, 0).resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert_valid" {
  count = var.use_alb && var.certificate_arn == "" && var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  certificate_arn = aws_acm_certificate.cert[0].arn
  validation_record_fqdns = [aws_route53_record.cert_validation[0].fqdn]
}

locals {
  https_enabled = var.use_alb && (var.certificate_arn != "" || (var.domain_name != "" && var.hosted_zone_id != ""))
}

resource "aws_lb_listener" "https" {
  count = local.https_enabled ? 1 : 0
  load_balancer_arn = aws_lb.dnl_alb[0].arn
  port = 443
  protocol = "HTTPS"
  certificate_arn = var.certificate_arn != "" ? var.certificate_arn : aws_acm_certificate.cert[0].arn
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.frontend[0].arn
  }
}

resource "aws_lb_listener" "http" {
  count = var.use_alb ? 1 : 0
  load_balancer_arn = aws_lb.dnl_alb[0].arn
  port = 80
  protocol = "HTTP"
  dynamic "default_action" {
    for_each = local.https_enabled ? [1] : []
    content {
      type = "redirect"
      redirect {
        port = "443"
        protocol = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
  dynamic "default_action" {
    for_each = local.https_enabled ? [] : [1]
    content {
      type = "forward"
      target_group_arn = aws_lb_target_group.frontend[0].arn
    }
  }
}

// Optional ALB path rule for /api -> backend target group
resource "aws_lb_listener_rule" "api_rule" {
  count = var.use_alb ? 1 : 0
  listener_arn = aws_lb_listener.https[0].arn
  priority = 100
  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.backend[0].arn
  }
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ECS task and service definitions are omitted for brevity; use terraform-aws-ecs modules or cloudformation
