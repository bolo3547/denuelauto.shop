# Denuel Auto - Frontend
## Upload workflow (presigned + confirm)

The frontend uses a presign + confirm flow for large file uploads (payment proofs, car images):

- POST `/api/uploads/sign` (authenticated) with { invoiceId?, filename, contentType, paymentMethod?, amount?, notes? } → returns `{ uploadUrl, fileUrl, proofId }` and creates a pending DB record.
- PUT to `uploadUrl` (direct S3 presigned PUT) with the file as the body.
- POST `/api/uploads/confirm` (authenticated) with `{ proofId }` to verify presence and trigger a virus scan (ClamAV) if installed; server marks proof as `succeeded`, `failed`, or `pending_scan`.

Ensure `S3_ENDPOINT`, `S3_BUCKET`, and server-side virus scanning (optional) are configured in production.

This folder contains the Next.js frontend for Denuel Auto using the App Router (Next 14).

Quick start

```powershell
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Notes
- Use `NEXT_PUBLIC_API_BASE_URL` to point to the backend.
- This prototype uses Tailwind (app dir), Framer Motion, React Hook Form, and Zod for the register flow.
- For testing:
  - `npm test` runs validator and a11y smoke tests via Jest (ts-jest + testing-library)
