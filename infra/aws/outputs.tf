output "ecr_repo_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_repo_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster" {
  value = aws_ecs_cluster.denuel_cluster.name
}

output "ecs_service_backend" {
  value = aws_ecs_service.backend.name
}

output "ecs_service_frontend" {
  value = aws_ecs_service.frontend.name
}

output "alb_dns_name" {
  value = var.use_alb ? aws_lb.dnl_alb[0].dns_name : ""
}

output "alb_security_group" {
  value = var.use_alb ? aws_security_group.alb[0].id : ""
}

output "certificate_arn" {
  value = var.use_alb && var.certificate_arn != "" ? var.certificate_arn : (var.use_alb && var.domain_name != "" && var.hosted_zone_id != "" ? aws_acm_certificate.cert[0].arn : "")
}

