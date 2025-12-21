#!/usr/bin/env bash
set -euo pipefail

TFVARS=${1:-terraform.tfvars}
if [ ! -f "$TFVARS" ]; then
  echo "ERROR: var file $TFVARS not found. Copy terraform.tfvars.example to terraform.tfvars and update variables."
  exit 1
fi

echo "Initializing Terraform..."
terraform -chdir=$(pwd) init -input=false -upgrade || terraform init

echo "Planning Terraform... (using $TFVARS)"
terraform -chdir=$(pwd) plan -var-file="$TFVARS" -out=tfplan

echo "To apply, run: terraform apply tfplan"
