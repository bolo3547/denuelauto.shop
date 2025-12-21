# Deployment Guide — Denuel Auto

This document provides recommended steps and examples to deploy Denuel Auto to a production environment. It covers a Linux VPS with Docker Compose, as well as high-level steps for AWS (ECS / Fargate) and Frontend hosting (Vercel).

## Important Note
- Ensure you provision production-grade services (managed Postgres, Redis, S3) for availability, backups, and security.
- Set up a secrets manager and do not commit secrets to source control.

---

## Pre-requisites
- Server with Docker Engine and Docker Compose v2+ installed (Ubuntu/Debian example)
- Domain name
- TLS certificate (Let's Encrypt recommended)
- Managed Postgres (RDS/DB), Redis (ElastiCache) or provision via Docker if acceptable
- S3 bucket and credentials

## Recommended Env Vars (example `.env.production`)
```
DATABASE_URL=postgresql://user:password@postgres:5432/denuel_auto
REDIS_URL=redis://redis:6379
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=denuel-auto-prod
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
JWT_SECRET=super-secret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=denuel_auto

## Environment Variables
- `JWT_SECRET` — secret for access token
- `REFRESH_TOKEN_SECRET` — secret for refresh tokens

### Refresh token cookie (optional)
When running a split deployment (frontend and backend on separate subdomains), you can enable httponly cookie-based refresh tokens instead of returning the raw refresh token in JSON responses.

- `REFRESH_COOKIE_NAME` (default: `refreshToken`) — cookie name for refresh tokens
- `REFRESH_COOKIE_DOMAIN` (optional) — set to `.denuelauto.com` to share refresh cookies across subdomains
- `REFRESH_TOKEN_MAX_AGE` (ms, default: `604800000`) — cookie max age
- `REFRESH_COOKIE_SAME_SITE` (default: `lax`) — use `none` for cross-site cookies (requires `secure=true`)

Make sure CORS credentials are enabled (`CORS_CREDENTIALS=true`) and the frontend uses `fetch(...,{ credentials: 'include' })` for APIs that rely on cookies.
```

## 1) Linux VPS (Docker Compose)

1. Copy project to server, or clone repo. Put `.env.production` on server and protect it (chmod 600).
2. Build images locally and push to a registry OR build on server.
3. On server:
```bash
# Pull latest or build locally
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations (one-time)
docker compose -f docker-compose.prod.yml exec backend bash -lc "npx prisma migrate deploy"

# Optionally seed demo or HQ data
docker compose -f docker-compose.prod.yml exec backend bash -lc "npm run seed:demo"
```
4. Configure Nginx as reverse proxy with TLS (Let's Encrypt cert).
5. Monitor logs and health: `docker logs -f <container>`; set up a centralized logs/metrics system.

### Example Nginx config (reverse proxy for Node app)
```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name your-domain.com;
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 2) Vercel / Next.js Frontend
- For the frontend, Vercel is recommended for static and SSR features. For SSR pages that require a Node backend, either host SSR on Vercel serverless or complement with a hosted backend service.
- Configure `NEXT_PUBLIC_API_BASE_URL` to point to backend API and add environment variables on Vercel's dashboard.

### Packaging for deploy (zip)

You can create a zip of deployable artifacts using the included script.

Full package (backend + frontend):

From the repository root:

```
npm run package:deploy -- --out my-deploy.zip
```

What it includes by default (if present):
- `dist/` (backend compiled output)
- `prisma/` (schema & migrations)
- `node_modules/` (if present)
- `package.json` and `package-lock.json`
- `frontend/out/` (static frontend export)

Frontend-only package (Imbra / static hosts):

If you only need the frontend static build (recommended for Imbra or other static hosts), use the frontend-only flag or the convenience npm script:

```
# Convenience script (packages frontend/export only)
npm run package:deploy:frontend -- --out frontend-deploy.zip

# Or directly
node ./scripts/package-deploy.js --frontend-only --out frontend-deploy.zip
```

What the frontend-only package includes (if present):
- `frontend/out/` (preferred - output from `next export`). **Files from `frontend/out/` will be placed at the root of the ZIP** (so `index.html` should be at the archive root).
- or `frontend/.next/` and `frontend/public/` (if `next export` was not used) — these will be placed in folders inside the ZIP.

The script is cross-platform and uses Node's `archiver` to produce a compressed zip.

CI: GitHub Actions

A companion workflow is included at `.github/workflows/package-frontend.yml`. It runs on `push` to `main` and supports manual dispatch. The workflow builds the frontend, runs `next export`, packages the frontend into `frontend-deploy.zip`, and uploads it as a workflow artifact named `frontend-deploy` (you can download it from the Actions run and upload it to Imbra).

## 3) AWS ECS (Fargate) (High-level)
### Automatic ECS Task Definition Registration
We've added a simple helper `scripts/ecs-deploy.sh` that reads the current task definition for a service, updates container definitions with new image URIs, registers a new task definition revision, and updates the ECS service to use it.

Usage (from GitHub Action or runner):
```
./scripts/ecs-deploy.sh <cluster> <service> <backend-image> <backend-container-name> [frontend-image] [frontend-container-name]
```

In the `deploy-ecs.yml` workflow we call this script with the commit-SHA-tagged images and example container names `web` (backend) and `frontend` (frontend). Adjust the container names if your ECS task uses different names.

1. Build Docker images and push to ECR.
2. Create ECS task definitions for `app`, `db` (if using RDS managed), and other services.
3. Use managed RDS (Postgres) and ElastiCache (Redis) for the DB and cache.
4. Use S3 for media.
5. Configure AWS ALB with TLS termination and route traffic to ECS.

### Quick Terraform/ECS starter (in repo)
We added a minimal Terraform skeleton in `infra/aws/` to provision:
 - ECR repositories for backend/frontend
 - (ECS cluster) placeholder

This is not a complete production infra, but a starting point. To use:
1. Install Terraform and configure `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`.
2. Run `terraform init` then `terraform apply` inside `infra/aws`.
3. After `terraform` creates ECR repositories, update the GitHub Actions `deploy-ecs.yml` secrets to reference `ECR_REPO_BACKEND` and `ECR_REPO_FRONTEND`.

### GitHub Actions notes
 - `deploy-vps-ssh.yml` uses `appleboy/ssh-action` and requires VPS SSH secrets and a server that accepts tar-based deployments.
 - `deploy-ecs.yml` pushes images to ECR and expects you to replace the ECS deployment step with cloud-formation/terraform or `aws ecs update-service` that refers to the new images.

## GitHub Secrets & Production Secrets Checklist
The following secrets should be added to GitHub Actions or your secrets manager and the `.env.production` file on your server:

- `AWS_ACCESS_KEY_ID` — AWS credentials for ECR/ECS deployment
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` — e.g., `us-east-1`
- `ECR_REPO_BACKEND`, `ECR_REPO_FRONTEND` — ECR repo names
- `ECS_CLUSTER_NAME`, `ECS_SERVICE_NAME` — ECS cluster & service to deploy
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` — (If using DockerHub in CI)
- `PROD_API_URL`, `PROD_TENANT_SLUG` — (For smoke tests)
- `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_ENDPOINT`, `NEXT_PUBLIC_BASE_URL` — for `.env.production`
 - `ADMIN_API_KEY` — Admin-only API key used by server to authenticate with admin APIs (keep in secret manager). Add to repo secrets with restricted access.

Add these secrets to GitHub (Repository -> Settings -> Secrets & Variables) and set `.env.production` on the server for `docker compose` deploy.


### GitHub Actions secrets to set
- For `deploy-vps-ssh.yml`
  - `VPS_HOST` — IP/host for your server
  - `VPS_USERNAME` — SSH username
  - `VPS_SSH_KEY` — Private SSH key (PEM format)
  - `VPS_SSH_PORT` — SSH port (default 22)
- For `deploy-ecs.yml`
  - `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` & `AWS_REGION`
  - `ECR_REPO_BACKEND`, `ECR_REPO_FRONTEND` — ECR repo names configured in `infra/aws` (default in variables.tf)
   - `IMAGE_BACKEND` & `IMAGE_FRONTEND` — Optional full image tags to pull on the compose host (overrides `denuel-auto-backend:latest` and `denuel-auto-frontend:latest`)
   - `ECS_CLUSTER_NAME` & `ECS_SERVICE_NAME` — ECS cluster & service names to update on deploy
   - `CONTAINER_BACKEND_NAME` & `CONTAINER_FRONTEND_NAME` — Container names used in the task definition (used when registering new task revisions)

  Staging-specific secrets/guidelines:
   - `STAGING_ECS_CLUSTER`, `STAGING_ECS_SERVICE` — ECS cluster/service to deploy staging images
   - `STAGING_TENANT_SLUG` — Tenant slug to use in smoke test API URLs
   - `STAGING_API_URL` — Base API URL for staging; `scripts/ecs-smoke-test.sh` will hit `STAGING_API_URL/t/<slug>/public/stock` and validate `totalCars` exists



## 4) Backup & Monitoring
- Setup daily DB backups; keep 7+ days retention.
- Configure S3 lifecycle and access policies.
- Set up log aggregation (CloudWatch/ELK/Datadog).
- Monitor CPU/Memory, GCs, and request latencies.

## 5) Security Checklist
- Rotate JWT secret and API keys periodically.
- Enforce HTTPS.
- Limit CORS to trusted domains.
- Use RBAC and permission checks.
- Use rate limiting (already included in app).

### Additional Security & Compliance Steps
- Ensure the production database is not publicly accessible. Whitelist only app IPs or private subnets.
- Configure S3 permission policy to prevent public listing/reading and set a lifecycle policy for sensitive objects.
- Use monitoring and alerting on suspicious login attempts, high request rates, or unusual background jobs.
- PII and data deletion: provide a way to remove PII data for deleted users (GDPR/CCPA compliance).
- For payments and buyer payment information, use tokenized third-party providers and avoid storing raw card data.
- Use an intrusion detection system (fail2ban, cloud WAF, AWS GuardDuty) if applicable.

## 6) Operational & Compliance Guidance
- Daily backups for Postgres with verified restore steps.
- S3 encryption at rest and access logs enabled.
- Configure audit logs and retention for at least 90 days (adjust per compliance needs).
- Test disaster recovery and backup restoration at least monthly.
- Enable access control for admin and HQ roles via RBAC and audit logs for critical actions.

### Monitoring & Observability
- Use application monitoring (Sentry/Datadog/New Relic) for error tracking.
- Use metrics for throughput, latency, CPU, memory, and background job failures.
- Centralize logs to a system that allows querying and alerting (ELK/CloudWatch/Datadog).

### Routine Maintenance
- Apply OS updates and Docker security patches weekly or as scheduled.
- Renew TLS certs automatically (Certbot or cloud provider-managed).
- Rotating keys and secrets every 90 days.

## 7) Runbooks
- **Upgrade**: Deploy new images into staging first. Run smoke tests, then rotate production.
- **Rollback**: Keep previous image tags, stop and start the prior version, and notify stakeholders.
- **Database restore**: Document steps to restore from backup and re-run any schema migrations only after validation.

### How to run the smoke test locally
1. Build and push the image tag or use an existing image tag in ECR.
2. Register the new task definition (or use `scripts/ecs-deploy.sh`) to update the service.
3. Run the smoke script locally against the API endpoint:

```bash
chmod +x scripts/ecs-smoke-test.sh
./scripts/ecs-smoke-test.sh https://staging.example.com/t/tenant-slug/public/stock totalCars
```

If the endpoint returns a valid JSON and contains `totalCars` key, the script returns success.



## 6) Operational Runbooks
- How to roll back deployments (keep previous image tags).
- Restore database from backup.
- Re-provision S3 bucket credentials.

## 7) Recommended Next Steps
1. Decide hosting model (VPS vs managed). If you don’t have large scale needs, a small VPS + Docker Compose is enough to start.
2. Set up automated CI/CD (GitHub Actions recommended) to build images and execute migrations.
3. Configure a basic monitoring dashboard and alerts.

---

If you'd like, I can also add a sample `docker-compose.prod.yml` (already added), a GitHub Actions workflow for CI/CD, and a `deploy.sh` script for your VPS. Which of these would you like next?
