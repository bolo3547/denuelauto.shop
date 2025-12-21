// ECS task definitions and service for backend & frontend (Fargate)
// This file is intentionally minimal and expects existing VPC subnets and security groups
// Provide `backend_image`, `frontend_image`, `subnet_ids`, and `security_group_ids` via tfvars

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole-${var.cluster_name}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = ["ecs-tasks.amazonaws.com"] }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.cluster_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions = jsonencode([
    {
      name      = var.container_backend_name
      image     = var.backend_image
      essential = true
      portMappings = [{ containerPort = var.backend_container_port, protocol = "tcp" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.cluster_name}-backend"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.cluster_name}-backend"
  retention_in_days = 14
}

resource "aws_ecs_service" "backend" {
  name            = "${var.cluster_name}-backend-service"
  cluster         = aws_ecs_cluster.denuel_cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.security_group_ids
    assign_public_ip = false
  }
  dynamic "load_balancer" {
    for_each = var.use_alb ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.backend[0].arn
      container_name   = var.container_backend_name
      container_port   = var.backend_container_port
    }
  }
  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_role_policy]
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.cluster_name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions = jsonencode([
    {
      name      = var.container_frontend_name
      image     = var.frontend_image
      essential = true
      portMappings = [{ containerPort = var.frontend_container_port, protocol = "tcp" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.cluster_name}-frontend"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.cluster_name}-frontend"
  retention_in_days = 14
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.cluster_name}-frontend-service"
  cluster         = aws_ecs_cluster.denuel_cluster.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.security_group_ids
    assign_public_ip = false
  }
  dynamic "load_balancer" {
    for_each = var.use_alb ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.frontend[0].arn
      container_name   = var.container_frontend_name
      container_port   = var.frontend_container_port
    }
  }
  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_role_policy]
}

// Optional ALB/TargetGroup should be created separately and associated with the services
