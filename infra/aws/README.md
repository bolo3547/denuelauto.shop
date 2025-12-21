# infra/aws

This folder contains Terraform configuration for a minimal infra scaffold for Denuel Auto.

What is included:
- ECR repos for backend/frontend
- ECS cluster
- Optional ECS task definitions and services (Fargate)
- Optional ALB (Application Load Balancer), target groups, listeners and optional ACM certificate via DNS validation

Prerequisites:
- AWS credentials that have permission to create ECR, ECS, IAM roles, CloudWatch Logs, ALB and Route53 records
- A VPC with subnets and security groups

Quickstart:
1. Copy `terraform.tfvars.example` to `terraform.tfvars` and update the values (VPC, subnets, domain, etc.)
2. Initialize terraform

```bash
cd infra/aws
terraform init
```

Windows PowerShell (native) - optional: run the included `run-terraform.ps1` helper:
```powershell
# copy example vars
Copy-Item terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars
notepad terraform.tfvars
.\run-terraform.ps1 terraform.tfvars
```

If you're running on Windows, you can also use WSL or Git Bash which supports `./run-terraform.sh`.

3. Plan and apply (use the tfvars file you created)

```bash
./run-terraform.sh terraform.tfvars

Notes about ALB and certificates:
- If you set `use_alb` to true, you must set `vpc_id`, `subnet_ids`, and `security_group_ids`.
- HTTPS listener requires either `certificate_arn` (existing ACM certificate) OR provide `domain_name` + `hosted_zone_id` so Terraform can request a certificate and validate the DNS entry. If you don't provide these, the HTTPS listener won't be created; HTTP listener will forward to the frontend.
```

Notes:
- If you set `use_alb` to `true`, ensure `vpc_id`, `subnet_ids`, and `security_group_ids` are provided.
- If you want Terraform to request an ACM certificate, set `domain_name` and `hosted_zone_id`; Terraform will add a DNS validation record.
- If you provide `certificate_arn`, Terraform uses it instead of requesting a new certificate.
