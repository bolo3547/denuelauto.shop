#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./scripts/deploy.sh [branch]
BRANCH=${1:-main}
REPO_DIR=/var/www/denuel
USER=$(whoami)

echo "Deploying branch ${BRANCH} to ${REPO_DIR}..."

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Repository not found at $REPO_DIR. Clone first or run initial-setup.sh"
  exit 1
fi

cd $REPO_DIR
git fetch --all --prune
git checkout $BRANCH
git pull origin $BRANCH

echo "Installing dependencies..."
npm ci --production

echo "Building..."
npm run build --if-present

echo "Reloading PM2..."
if pm2 describe denuel-api > /dev/null 2>&1; then
  pm2 reload denuel-api --update-env
else
  pm2 start ecosystem.config.js --env production
fi

pm2 save

echo "Deployment complete. Tail logs with: pm2 logs denuel-api"
