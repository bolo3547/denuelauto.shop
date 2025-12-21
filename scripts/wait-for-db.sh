#!/usr/bin/env bash
set -euo pipefail

# Wait for a TCP host/port until it's available
# Usage: wait-for-db.sh <host> <port> [timeout_seconds]
HOST=${1:-localhost}
PORT=${2:-5432}
TIMEOUT=${3:-60}

echo "Waiting for DB ${HOST}:${PORT} to be available... (timeout=${TIMEOUT}s)"
end=$((SECONDS+TIMEOUT))
while true; do
  if command -v nc >/dev/null 2>&1; then
    if nc -z "$HOST" "$PORT"; then
      echo "DB is up: ${HOST}:${PORT}"
      exit 0
    fi
  else
    if (echo > /dev/tcp/${HOST}/${PORT}) >/dev/null 2>&1; then
      echo "DB is up: ${HOST}:${PORT}"
      exit 0
    fi
  fi
  
  fi
  if [ $SECONDS -ge $end ]; then
    echo "Timeout waiting for DB ${HOST}:${PORT} after ${TIMEOUT}s" >&2
    exit 1
  fi
  sleep 1
done
