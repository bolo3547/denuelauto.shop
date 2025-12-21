Service Code mappings (example):
- *384*26056# → https://api.denuel.com/ussd/retail
- *384*53920# → https://api.denuel.com/ussd/rental

Set the USSD API Task ID env variable to the aggregator task id provided (USSD_API_TASK_ID):
```
USSD_API_TASK_ID=atsk_be7ab4efddfb761ccdd4eebcd4f91a686b1752b34ee565c0f9cc91216922217b30cb2956
```

Sample curl: (retail channel)
```powershell
curl -X POST https://api.denuel.com/ussd/retail \
	-H "X-API-TASK-ID: $env:USSD_API_TASK_ID" \
	-d "sessionId=test&phoneNumber=%2B260971234567&text="
```

# DENUEL USSD — Zambia (Buy via USSD)

This document describes how to configure and test the USSD Buy-a-Car flow (prod-ready with MTN/Airtel collection).

Environment variables required
- AT_USERNAME, AT_API_KEY, AT_SHORTCODE (Africa's Talking)
- MTN_MOMO_API_USER, MTN_MOMO_API_KEY, MTN_MOMO_SUBKEY, MTN_MOMO_BASEURL
- AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_BASEURL
- USSD_SIGNING_SECRET, PUBLIC_BASE_URL, REDIS_URL, DATABASE_URL, NODE_ENV

Local dev quick run
1. Install dependencies:
```powershell
cd "New folder"
npm install
```
2. Run Prisma migrations and seed:
```powershell
npx prisma migrate dev
node prisma/seed.ts
```
3. Start dev server:
```powershell
npm run dev
```

Africa's Talking USSD configuration
- Configure callback to POST https://{PUBLIC_BASE_URL}/api/ussd
- Callback payload will include `sessionId`, `phoneNumber`, `text`, `serviceCode`
- Our server supports mapping serviceCode or `text` suffix to a tenant. Use channel mapping in `UssdChannel`.

Testing USSD flow using cURL
```powershell
curl -X POST https://localhost:3000/api/ussd -d "sessionId=test-1&phoneNumber=+260971234567&text=&serviceCode=*384*23*DEALER#" -H "Content-Type: application/x-www-form-urlencoded"
```

Collect & webhook simulation
1. Create collect via `POST /api/payments/mtn/collect` with { msisdn, amount }
2. Send a webhook to `/api/webhooks/mtn-momo` with payload { request_id, status: 'success' } signed with `USSD_SIGNING_SECRET`.

Notes
- This setup includes placeholder clients for MTN/Airtel and Africa's Talking. Replace with real integration and secure secrets storage for production.
