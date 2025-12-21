# Airtel Money Integration

## Setup

1. Register your app on the Airtel Money developer portal and obtain:
   - Client ID
   - Client Secret
   - Base URL (sandbox or production)
   - Webhook Signing Secret

2. Set the following environment variables in your deployment or `.env` file:
```
AIRTEL_CLIENT_ID=your_client_id
AIRTEL_CLIENT_SECRET=your_client_secret
AIRTEL_BASEURL=https://sandbox.airtel.money
AIRTEL_SIGNING_SECRET=your_webhook_signing_secret
```

## Usage

- USSD flow now supports Airtel Money selection for payments.
- API endpoint for collection: `POST /api/payments/airtel/collect`
- Webhook endpoint for Airtel Money: `POST /api/webhooks/airtel-money`

## Testing

- Run the Airtel webhook test:
```
npm test tests/airtel.webhook.test.ts
```
- Use ngrok or a public URL for webhook testing with Airtel's developer portal.

## Notes
- Ensure your webhook endpoint is registered in the Airtel developer portal.
- For local development, use ngrok to expose your API/webhook endpoint.
- The integration supports idempotency and signature verification for security.

## Troubleshooting
- Check logs for token or collection errors.
- Verify environment variables are set and correct.
- Ensure your webhook signing secret matches Airtel's configuration.
