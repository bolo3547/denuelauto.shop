
import crypto from 'crypto';
import fetch from 'node-fetch';

let tokenCache: { token?: string; expiresAt?: number } = {};

async function getToken() {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt - 5000) {
    return tokenCache.token;
  }
  const clientId = process.env.AIRTEL_CLIENT_ID;
  const clientSecret = process.env.AIRTEL_CLIENT_SECRET;
  const baseUrl = process.env.AIRTEL_BASEURL || 'https://sandbox.airtel.money';
  if (!clientId || !clientSecret) throw new Error('Airtel credentials not configured');

  const b64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${b64}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtel token request failed ${res.status} ${text}`);
  }
  const j = await res.json();
  tokenCache = { token: j.access_token, expiresAt: Date.now() + (j.expires_in * 1000) };
  return tokenCache.token;
}

export async function createAirtelCollection({ msisdn, amount, currency = 'ZMW', externalId }: { msisdn: string; amount: number; currency?: string; externalId?: string }) {
  const token = await getToken();
  const baseUrl = process.env.AIRTEL_BASEURL || 'https://sandbox.airtel.money';
  const requestId = `AIRTEL-${crypto.randomBytes(6).toString('hex')}`;

  const payload = {
    amount: String(amount),
    currency,
    externalId,
    payer: { msisdn }
  };

  const url = `${baseUrl}/collection/v1_0/requesttopay`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Request-Id': requestId
      },
      body: JSON.stringify(payload)
    });

    const body = await res.text();
    if (!res.ok) {
      throw new Error(`Airtel collection failed ${res.status} ${body}`);
    }
    const json = JSON.parse(body);
    return { ok: true, requestId };
  } catch (err) {
    console.error('Airtel create collection error: ', err);
    throw err;
  }
}

export function verifyAirtelSignature(raw: string | undefined, signature: string | undefined, secret?: string) {
  if (!raw || !signature || !secret) return false;
  const h = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return h === signature;
}

export default { getToken, createAirtelCollection, verifyAirtelSignature };
