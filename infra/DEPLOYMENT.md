Deployment checklist and VPS runbook
=================================

This document contains step-by-step commands for deploying the API to a Linux VPS (Debian/Ubuntu). Adjust paths and usernames to suit your environment.

Prerequisites
 - A VPS with a non-root user (e.g. `deploy`) with sudo privileges
 - DNS A record for `api.denuel-auto.com` pointing to the server
 - PostgreSQL instance (external or local) with connection URL
 - Node.js 18+ and NPM installed on the VPS

Quick checklist
 - Create server user: `sudo adduser deploy && sudo usermod -aG sudo deploy`
 - Open firewall ports: `sudo ufw allow OpenSSH`, `sudo ufw allow 'Nginx Full'`
 - Clone repo into `/var/www/denuel`
 - Add config to `/var/www/denuel/.env` (see env list below)
 - Install dependencies and build
 - Start with PM2 and enable service
 - Configure Nginx, obtain SSL cert via Certbot

Folder layout (recommended)

- /var/www/denuel
  - .env
  - ecosystem.config.js
  - node_modules/
  - build/ (frontend export)

Environment variables (minimum)
- `PORT` (default: 4000)
- `DATABASE_URL` (Postgres)
- `CORS_ORIGINS` (e.g. https://www.example.com)
- `CORS_CREDENTIALS` (true/false)
- `JWT_SECRET` (access token secret)
- `REFRESH_TOKEN_SECRET`
- `REFRESH_COOKIE_NAME` (e.g. denuel_refresh)
- `REFRESH_COOKIE_DOMAIN` (optional; set domain for cookie)
- `NODE_ENV=production`

Install & run (copy/paste)

```bash
# on the server
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git build-essential

# create user and directory
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/denuel && sudo chown deploy:deploy /var/www/denuel

sudo -i -u deploy bash <<'EOF'
cd /var/www/denuel
git clone https://your-repo.git .
npm ci --production
# build / export frontend if separated (if using static export):
cd frontend && npm ci && npm run build && npm run export
cd /var/www/denuel
EOF

# install pm2 globally and run ecosystem
sudo npm i -g pm2 pm2-runtime
sudo -u deploy pm2-runtime start /var/www/denuel/ecosystem.config.js --env production

# or, use the included deploy helper scripts
# - PM2 deploy (recommended for this repository layout):
#   sudo ./scripts/deploy.sh [branch]
# - Docker Compose deploy (if you prefer containers):
#   ./scripts/deploy-docker.sh /path/to/checkout .env.production

# create systemd unit (optional):
sudo cp infra/systemd/denuel-api.service /etc/systemd/system/denuel-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now denuel-api

# nginx setup
sudo cp infra/nginx/api.denuel-auto.com.conf /etc/nginx/sites-available/api.denuel-auto.com
sudo ln -sf /etc/nginx/sites-available/api.denuel-auto.com /etc/nginx/sites-enabled/api.denuel-auto.com
sudo nginx -t && sudo systemctl reload nginx

# obtain cert via certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.denuel-auto.com
```

Healthcheck

After starting, check `https://api.denuel-auto.com/health` — it should respond with `{ ok: true }` if DB is reachable.

Playwright e2e

To run the Playwright e2e tests against the deployed API, make sure the frontend static export is served (e.g. via Nginx) and set `API_BASE_URL=https://api.denuel-auto.com` in the frontend test environment. Then run:

```bash
cd frontend
npx playwright test e2e/tests/auth-cookie.spec.ts -c e2e/playwright.config.ts --project=chromium
```

Troubleshooting
- If Certbot fails due to DNS or proxy, check Cloudflare proxying (orange cloud) — disable or use DNS-01 challenge.
- Check pm2 logs: `pm2 logs` and `pm2 monit`.
- Check Nginx logs: `/var/log/nginx/denuel-api.error.log` and access log.

Want me to template this into an Ansible playbook or generate ready-to-run commands for your server? Reply with your VPS OS and domain and I can generate the exact playbook/commands.
