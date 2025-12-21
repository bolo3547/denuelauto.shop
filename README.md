# Denuel - Multi-Tenant Car Dealership Management (Prototype)

This repository is a prototype for a multi-tenant car dealership management system. It includes a Node/Express backend with Prisma, and a Next.js frontend for public catalog.

## Features
- Multi-tenant database models (Prisma)
- Admin routes for cars, leads, quotes, proformas, payments, agents, buyers, shipments, export rules, and analytics

## What's included
- Backend: Express + TypeScript + Prisma (models, routes, middleware)
- Frontend: Next.js + Tailwind public catalog and basic Admin pages (Login, Inventory)
- Seed script to populate demo tenant and demo data
- Basic unit tests (Jest + Supertest) and basic E2E scaffold (Playwright)

OTP & register endpoints (new)
- `POST /api/auth/otp/send` - Body: { contact: 'user@example.com' }  — sends a 6-digit OTP to the contact via email/SMS (console in dev).
- `POST /api/auth/otp/verify` - Body: { contact, code } — verify the OTP.
- `POST /api/auth/register` - Body: { email, password, fullName, phone, tenantId } — creates the user (requires OTP verification for the contact).
## Quickstart
### Prerequisites
- Node.js 18+
- PostgreSQL

### Setup
1. Install dependencies

```powershell
npm install
cd frontend && npm install
```

2. Create `.env` from `.env.example` and set `DATABASE_URL`, `JWT_SECRET`, etc. (Optional AI: set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` and `AI_PROVIDER`)

3. Generate Prisma client and run migrations

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed demo data

```powershell
npm run seed
```

5. Start backend

```powershell
npm run dev
```

6. Start frontend

```powershell
cd frontend
npm run dev

Note: The frontend communicates with the backend API using environment variable `NEXT_PUBLIC_API_BASE_URL`, e.g. `http://localhost:4000` for local testing. Add a `.env.local` in `frontend/` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.

## Deployment & Secrets
For production deploys, create a `.env.production` file using `.env.production.example` and ensure the following secrets are set in your CI/CD and/or server environment (don't commit secrets in the repo):

- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `NEXT_PUBLIC_BASE_URL`
- S3: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- AWS for ECR/ECS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPO_BACKEND`, `ECR_REPO_FRONTEND`, `ECS_CLUSTER_NAME`, `ECS_SERVICE_NAME`
- DockerHub: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (optional)

See `DEPLOYMENT.md` for example deploy commands and GitHub Actions setup.

Local helper scripts:

- `./scripts/local-build.sh` - start docker compose for dev and wait for services to be healthy.
- `./scripts/wait-for-db.sh` - wait for DB TCP port (host/port) until available.

Admin pages (Next.js) require a valid JWT for fetch calls (Authorization: Bearer <token>). For local testing, login using the seeded admin credentials or generate a JWT with `node -e "console.log(require('jsonwebtoken').sign({id:'admin', role:'dealer_owner', tenantId: '<tenant-id>'}, 'changeme'))"` and store in `localStorage.setItem('token', '<token>')`.
```

## SSR & Sitemap
- Pages under `/t/:slug` for catalog and car details use Next.js SSR (`getServerSideProps`) to render for faster LCP.
- Sitemap generation: run `node ./scripts/generate-sitemap.ts` before build to write `frontend/public/sitemap.xml` using your `NEXT_PUBLIC_SITE_URL` env var.

## E2E
- Playwright tests can be executed with `npm run test:e2e` at the repo root (ensure `NEXT_PUBLIC_API_URL` points to dev server or use baseURL in e2e config).

## Scripts
- `npm run dev` - Start backend in dev mode (ts-node-dev)
- `npm run seed` - Run the seed script
- `npm run prisma:migrate` - Run Prisma migration
- `cd frontend && npm run dev` - Start Next.js frontend
- `npm test` - Run unit/integration tests (runs Jest for backend tests)
- `cd frontend && npm test` - Run frontend unit tests (Jest)
- `cd frontend && npm run build` and `cd frontend && npm start` - Production build and start

CI: A GitHub Actions workflow (`.github/workflows/ci.yml`) runs backend and frontend tests on push and pull requests. Configure repository secrets for production variables before enabling CI for deployments.

Print/Document endpoint
- `GET /print/:template/:id?format=pdf|html` - Render or download a document for the specified template and ID. Requires JWT. E.g. `curl -H "Authorization: Bearer <token>" 'http://localhost:4000/print/proforma/pf1?format=pdf'`

- `POST /api/cars/:id/media/ingest` - Ingest an image for a car, accepts `{ "url": "https://..." }` or `{ "base64": "data:image/png;base64,..." }` and returns a derived thumb/detail URLs and quality score. Requires `cars.media.manage` permission.

Environment Variables for Production
- `ENCRYPTION_KEY`: Base64 (32 byte) value for encrypting provider credentials. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- S3 uploads:
	- `S3_BUCKET`: Target bucket name
	- `AWS_REGION`: AWS region of the bucket (e.g. `us-east-1`)
	- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: Credentials for signing uploads (server-side)
	- Frontend can also use `NEXT_PUBLIC_S3_BUCKET` and `NEXT_PUBLIC_AWS_REGION` for display-only
	- For local dev fallback, set `ALLOW_LOCAL_UPLOADS=true` to enable `/api/uploads/receive` saving to `public/uploads`

Webhook usage
Billing & Domains
- `POST /super/tenants/create` - Create a new tenant with name, slug and ownerEmail; will create a billing account and default entitlements.
- `POST /super/tenants/:id/provision` - Provision tenant resources (buckets, seed data).
- `POST /super/tenants/:id/redact` - Request PII redaction (creates a background job).
- `POST /super/tenants/:id/teardown` - Soft-delete tenant and enqueue teardown.
- `POST /api/admin/billing/subscribe` - Subscribe tenant to a plan (requires step-up + billing permission).
- `POST /api/admin/billing/cancel` - Cancel subscription.
- `GET /api/admin/billing/entitlements` - Get computed entitlements for tenant.
- `POST /billing/webhooks/:provider` - Billing webhook endpoint for providers to post events; header `x-tenant-id` is required.
- `POST /api/admin/domains` - Add custom domain. Returns DNS TXT `value` to add for verification.
Jobs & Backgrounds
- Run background job worker:
	- `npm run jobs:run` starts the simple job runner that processes `hold_expiry`, `billing_entitlements_refresh`, and `domain_cert_renewal` jobs.
- For production, replace with `bullmq` or `agenda` worker backed by Redis.
- `POST /api/admin/domains/:id/verify` - Verify custom domain via DNS TXT or `verifyToken`; requests a certificate (mock).
- For provider webhooks, requests should include `x-tenant-id` header to identify tenant (or the webhook should be configured to call a tenant-specific URL). The server verifies HMAC via `x-signature` using the tenant's configured webhook secret when present.

- Notifications: when invoices are marked paid (billing webhook) or when HQ approves/rejects payment proofs, tenant admins and buyers receive in-app notifications and email/SMS when configured.

## Notes
This is a scaffold / prototype. For production, add more validation, logging, robust RBAC enforcement, image handling, cloud storage, audit retention, CI, and testing.
Also consider: adding S3 for media, moving to microservice architecture, storing audit logs in a dedicated analytics store, and supporting more QA & E2E tests.

Step-up authentication for sensitive actions:
- Use the admin's JWT Authorization header to call `POST /api/auth/step-up` with `{ "password": "<your-password>" }`.
- The response returns: `{ "stepUp": "<short_lived_token>" }`. Include this token in subsequent sensitive requests as the header `x-stepup-token: <token>`.
- Example: verifying a payment `PATCH /api/payments/:id/verify` requires the `x-stepup-token` and `payments.verify` permission.

- Demo credentials for the seeded admin user:
- admin: `admin@sample-dealer.com` / `password123`

## RBAC (roles & permissions)

- **dealer_owner**: all permissions
- **dealer_manager**: inventory/lead/quote/proforma/payment management
- **sales**: leads, quotes, proformas (create/read)
- **media**: upload and manage media
- **accountant**: verify payments, view proformas
- **exporter_manager**: manage export ports/rules, shipments
- **agent**: manage assigned leads/deals
- **buyer**: access to own quotes/proformas/payments

New endpoints added in this commit: `/api/agent-deals`, `/api/trade-ins`, `/api/test-drives` (OpenAPI updated accordingly).
Additional endpoints: `/buyer/cars/:id/hold`, `/buyer/proformas/:id/escrow/intent`, `/buyer/proformas/:id/escrow/release`, `/public/reviews`, `/buyer/reviews`, `/t/:slug/public/attribution/agent`, `/t/:slug/agent`

Agent Portal:
- Visit `/t/:slug/agent` to login with agent email (no password in prototype). Returns a JWT.
- Agent pages: `/t/:slug/agent/me`, `/t/:slug/agent/leads`, `/t/:slug/agent/commissions`.

---

## Production Deployment Guide

### Quick Deploy Steps

```bash
# 1. Clone repository (only source code, no build artifacts)
git clone <repo-url>
cd <project>

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with production values (DATABASE_URL, JWT_SECRET, etc.)

# 4. Run database migrations
npx prisma migrate deploy

# 5. Build the application
npm run build           # Backend
cd frontend && npm run build && cd ..

# 6. Start production server
npm start               # Backend
cd frontend && npm start # Frontend (or use PM2/systemd)
```

### Why Build Artifacts Are Excluded

- **`.next/`, `out/`, `dist/`**: Generated during `npm run build`. These are environment-specific and should be built on the target server.
- **`node_modules/`**: Installed via `npm install`. Ensures correct native binaries for the target OS.
- **`*.zip`, `deploy-package/`**: Temporary deployment archives, not source code.
- **`.env*`**: Contains secrets (API keys, database credentials). Never commit these.
- **`verify-zip/`**: Build verification output, not needed in version control.

### Environment Variables

Create `.env` from `.env.example` with these required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL for frontend |
| `S3_*` | S3/Object storage credentials (optional) |

> **Security**: Never commit `.env` files. Use environment variables or secrets management in production.

