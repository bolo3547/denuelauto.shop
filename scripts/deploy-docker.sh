#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper for a Linux host using Docker Compose.
# Usage: ./scripts/deploy-docker.sh /path/to/checkout .env.production

CHECKOUT_DIR=${1:-.}
ENV_FILE=${2:-.env.production}

if [ ! -f "${CHECKOUT_DIR}/docker-compose.prod.yml" ]; then
  echo "docker-compose.prod.yml not found in ${CHECKOUT_DIR}. Exiting." >&2
  exit 1
fi

if [ ! -f "${ENV_FILE}" ]; then
  echo "Env file ${ENV_FILE} not found. Create it with production secrets." >&2
  exit 1
fi

echo "Starting docker-compose deploy from ${CHECKOUT_DIR} with env ${ENV_FILE}"

export $(grep -v '^#' "${ENV_FILE}" | xargs -d '\n')

cd "${CHECKOUT_DIR}"
docker compose -f docker-compose.prod.yml pull || true
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for DB to be available..."
./scripts/wait-for-db.sh ${DATABASE_HOST:-db} ${DATABASE_PORT:-5432} 60 || true

echo "Waiting for backend to respond to healthcheck..."
TRIES=0
until docker compose -f docker-compose.prod.yml exec -T backend wget -qO- --timeout=2 http://localhost:4000/api/health || [ $TRIES -ge 12 ]; do
  TRIES=$((TRIES+1))
  echo "Waiting for backend... attempt ${TRIES}/12"
  sleep 5
done

echo "Running migrations (if available)"
docker compose -f docker-compose.prod.yml exec -T backend bash -lc "npx prisma migrate deploy || true"

echo "Deploy completed. Check backend logs: docker compose -f docker-compose.prod.yml logs -f backend"
