#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <url> <expected-json-key>"
  exit 1
fi
URL=$1
KEY=$2

echo "Running smoke test against ${URL} expecting key '${KEY}'"
HTTP_CODE=$(curl -s -o /tmp/ecs-smoke-output.json -w "%{http_code}" -L "${URL}")
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "Smoke test failed: HTTP ${HTTP_CODE}" >&2
  cat /tmp/ecs-smoke-output.json >&2
  exit 2
fi

if ! jq -e ".${KEY}" /tmp/ecs-smoke-output.json >/dev/null; then
  echo "Smoke test failed: key '${KEY}' not found in response" >&2
  cat /tmp/ecs-smoke-output.json >&2
  exit 3
fi

echo "Smoke test passed."
rm -f /tmp/ecs-smoke-output.json
