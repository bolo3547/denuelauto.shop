#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 your.domain.com"
  exit 2
fi

DOMAIN="$1"
SRC=api.DOMAIN.com.conf
DEST="api.${DOMAIN}.conf"

if [ ! -f "$SRC" ]; then
  echo "Source file $SRC not found. Run from infra/nginx directory."
  exit 3
fi

sed "s/api.DOMAIN.com/api.${DOMAIN}/g; s/DOMAIN.com/${DOMAIN}/g" "$SRC" > "$DEST"
echo "Wrote $DEST. Copy it to /etc/nginx/sites-available/ and update the server_name and cert paths as needed."
