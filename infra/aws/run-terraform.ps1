param(
  [string]$tfvars = "terraform.tfvars"
)

function Check-Terraform {
    $tf = Get-Command terraform -ErrorAction SilentlyContinue
    if (-not $tf) {
        Write-Error "Terraform not found. Please install Terraform and add it to your PATH. See https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli"
        exit 1
    }
}

if (-not (Test-Path $tfvars)) {
    Write-Error "Var file $tfvars not found. Copy terraform.tfvars.example to terraform.tfvars and update variables."
    exit 1
}

Check-Terraform

Write-Host "Initializing Terraform..."
terraform init -input=false -upgrade

Write-Host "Planning Terraform with var file: $tfvars"
terraform plan -var-file="$tfvars" -out=tfplan

Write-Host "All done. To apply run:'terraform apply tfplan'"
