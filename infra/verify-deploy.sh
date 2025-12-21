#!/usr/bin/env bash
set -euo pipefail

echo "Verifying deployment artifacts..."

check() {
  if [ -e "$1" ]; then
    printf "OK  - %s\n" "$1"
  else
    printf "MISSING - %s\n" "$1"
    MISSING=1
  fi
}

MISSING=0
check infra/nginx/api.DOMAIN.com.conf || true
check infra/nginx/api.denuel-auto.com.conf
check infra/nginx/replace-domain.sh
check infra/nginx/README.md
check infra/systemd/denuel-api.service
check ecosystem.config.js
check scripts/deploy.sh
check scripts/deploy-docker.sh
check infra/DEPLOYMENT.md

if [ "$MISSING" -eq 1 ]; then
  echo
  echo "One or more files are missing. Please review the output above."
  exit 2
fi

echo "All required deployment files are present. Review and edit placeholders (DOMAIN.com, paths, .env files) before running."
