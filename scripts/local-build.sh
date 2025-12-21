#!/usr/bin/env bash
set -euo pipefail

echo "Building and starting containers (dev compose)..."
docker compose -f docker-compose.yml up -d --build

echo "Waiting for DB..."
./scripts/wait-for-db.sh db 5432 60

echo "Waiting for backend health..."
TRIES=0
until docker compose -f docker-compose.yml exec -T backend wget -qO- --timeout=2 http://localhost:4000/api/health || [ $TRIES -ge 24 ]; do
  TRIES=$((TRIES+1))
  echo "Waiting for backend... attempt ${TRIES}/24"
  sleep 5
done

echo "Running a quick smoke test against frontend and backend"
docker compose -f docker-compose.yml exec -T backend wget -qO- http://localhost:4000/api/health || true
docker compose -f docker-compose.yml exec -T frontend wget -qO- http://localhost:3000 || true

echo "To stop containers run: docker compose -f docker-compose.yml down"
