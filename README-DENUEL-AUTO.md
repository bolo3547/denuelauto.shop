# Denuel Auto Setup

## Env Vars (subset)
- `DATABASE_URL`: Postgres connection
- `REDIS_URL`: Redis
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: MinIO/S3
- `NEXT_PUBLIC_BASE_URL`: Base URL for SSR fetch
- `SENTRY_DSN`: TODO
- `AIRTEL_API_KEY`, `MTN_API_KEY`: TODO
- `EMAIL_PROVIDER_*`, `SMS_WHATSAPP_*`: TODO

## Local Commands
```powershell
npm install
npx prisma migrate dev --name init-denuel-auto
npm run seed:hq
npm run seed:demo
docker-compose -f "New folder/docker-compose.yml" up --build
Note: This repository now uses separate `backend` (Express API on port 4000) and `frontend` (Next.js app on port 3000) services in Docker Compose. Use `docker compose ps` to list running services.
npm run dev
## Production deployment

See `DEPLOYMENT.md` for production deployment guides and hosting options.
```

## Testing Offline PWA
- Use Agent login page and trigger actions offline.
- Queue is stored in IndexedDB, sync via `/api/t/:tenantSlug/agent/sync`.

## Payment Proof Flow
- Tenant uploads to S3 via signed URL, creates payment proof.
- HQ reviews: approve sets `Invoice.paid=true`, writes `AuditLog`, notifies tenant.

## Notes
- All amounts stored in minor units.
- Tenant isolation enforced on DB queries.
- TODO: Hook up real integrations (WhatsApp, Airtel/MTN, gateway).

## OpenChat Integration (AI assistant)

This project includes a simple OpenChat integration for tenant assistance, car suggestions, reminders, and accounting help.

1. Add OpenChat env vars to `.env`:
```
OPENCHAT_API_KEY=your_openchat_api_key
OPENCHAT_API_URL=https://api.openchat.yourprovider/v1
```

2. Endpoints:
- `POST /api/openchat/suggest-car` — Request body: `{ preferences: {...}, tenantId }`.
- `POST /api/openchat/tenant-learn` — Request body: `{ tenantId, tenantData }`.
- `POST /api/openchat/reminder` — Request body: `{ tenantId, reminderText, date }`.
- `POST /api/openchat/accounting` — Request body: `{ tenantId, calcPrompt }`.

3. Example `curl` call:
```bash
curl -X POST http://localhost:4000/api/openchat/suggest-car -H 'Content-Type: application/json' -d '{"preferences":{"budget":20000,"type":"suv"}}'
```

4. Notes:
- The OpenChat router will call your configured `OPENCHAT_API_URL` and return the provider response JSON. If using a different provider than OpenChat, adjust `OPENCHAT_API_URL` accordingly.
- You can store tenant summaries in Redis to personalize further.

## Running locally

```powershell
cd "New folder"
npm install
npm run dev # or npm run build; npm start
```

## Production Deployment (Imbra / Docker host)

1. Create a `.env.production` file on your local machine with production secrets (do not commit it).
2. Option A (manual deploy): Build, push, and deploy via SSH:

```bash
# Build / push and deploy (example)
./scripts/deploy-imbra.sh -r <your-dockerhub-username> -h <remote-host> -u <remote-user> -p ~/denuel -e ./.env.production -k ~/.ssh/id_rsa
```

3. Option B (CI/CD with GitHub Actions): Configure repository secrets:
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub personal access token
- `DOCKERHUB_USERNAME` - set if used for image names
- `IMAGE_REGISTRY` - optional registry, e.g., `docker.io`
- `SSH_PRIVATE_KEY` - private key for the server user
- `REMOTE_HOST` - the Imbra host IP
- `REMOTE_USER` - the SSH user
- `REMOTE_PATH` - folder on host to deploy to, e.g., `/home/ubuntu/denuel`

The CI workflow (`.github/workflows/deploy-imbra.yml`) will build images and deploy them to your host automatically when you push to `main`.


