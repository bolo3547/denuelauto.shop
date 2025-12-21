# Denuel Auto — Tenant Registration Wizard

Commands (PowerShell):

```powershell
# Install deps
npm install

# Validate Prisma schema
npm run prisma:validate

# Create initial migration and generate client
npm run prisma:migrate
npm run prisma:generate

# Start frontend (Next.js)
cd frontend; npm install; npm run dev
```

API Contracts

- POST `app/api/register/tenant/estimate` — Request body (example):
```json
{
  "business": {"businessName":"Zed Motors","country":"Zambia","city":"Lusaka","businessType":"dealer","contactName":"Jane","contactEmail":"jane@example.com","contactPhone":"+260..."},
  "operations": {"expectedListings": 100, "expectedSales": 20, "staffCount": 25, "multiBranch": true, "branchCount": 3, "requiredModules": {"cifCalculator": true, "onlinePayments": true, "whatsappIntegration": true, "customerAccounts": true, "apiAccess": false, "multiWarehouse": true}},
  "branding": {"themePreset":"BEFORWARD","logoUrl":"https://.../logo.png","primaryColor":"#FF7900"},
  "pricing": {"billingCycle":"monthly","promoCode":"PROMO10","trialRequested":false}
}
```
Response (example):
```json
{
  "ok": true,
  "breakdown": {
    "tier": "medium",
    "basePriceMinor": 1500000,
    "currency": "ZMW",
    "billingCycle": "monthly",
    "lines": [
      {"label":"Medium tier","amountMinor":1500000,"type":"base"},
      {"label":"Online payments","amountMinor":300000,"type":"addon"},
      {"label":"WhatsApp integration","amountMinor":120000,"type":"addon"},
      {"label":"Multi-warehouse","amountMinor":250000,"type":"addon"},
      {"label":"Additional branches","amountMinor":500000,"type":"surcharge"},
      {"label":"Staff surcharge","amountMinor":1000000,"type":"surcharge"},
      {"label":"Total (monthly)","amountMinor":3863000,"type":"total"}
    ],
    "totalMinor": 3863000,
    "annualTotalMinor": 46356000
  }
}
```

- POST `app/api/register/tenant/submit` — creates TemporaryRegistration + pending Invoice + audit logs.
- GET `app/api/register/tenant/{invoiceId}/status` — returns payment status.
- POST `app/api/register/tenant/{invoiceId}/payment-proof` — stores proof (TODO signed uploads).
- GET `app/api/hq/registration/pending` — list pending.
- POST `app/api/hq/registration/{tenantId}/approve` — HQ approves (now creates Tenant, Subscription, owner user and sends welcome email).
- POST `app/api/hq/registration/{tenantId}/reject` — HQ rejects registration (status -> REJECTED).

Security & TODOs

- Server-side pricing re-calculation; never trust client totals.
- Rate limiting and CSRF protection for public endpoints.
- Signed S3 uploads for logo and payment proof; virus scan (implemented - presign + confirm endpoints). See `/api/uploads/sign` and `/api/uploads/confirm` for presign and scan/confirm flow. HQ listing for payment proofs now requires HQ admin auth. Payment proof review now supports storing a rejection reason and sends notifications with the reason to buyers and submitters.
- Payment gateway integration (TODO), email/SMS/WhatsApp notifications (partially implemented for payments and payment-proof workflows), KYC validation (TODO).
- Audit log for submit and approve actions.

Admin Configuration
-------------------
Set the server-only admin API key as `ADMIN_API_KEY` in your `.env` or in your secret manager. Keep the key private and do not expose it to the client or in public repos.

