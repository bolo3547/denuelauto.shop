import crypto from 'crypto';
import fetch from 'node-fetch';

let tokenCache: { token?: string; expiresAt?: number } = {};

async function getToken() {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt - 5000) {
    return tokenCache.token;
  }
  const user = process.env.MTN_MOMO_API_USER;
  const key = process.env.MTN_MOMO_API_KEY;
  if (!user || !key) throw new Error('MTN credentials not configured');
  // Replace with real MTN token request in production
  const fakeToken = crypto.randomBytes(24).toString('hex');
  tokenCache = { token: fakeToken, expiresAt: Date.now() + 60 * 60 * 1000 };
  return tokenCache.token;
}

export async function createMtnCollection({ msisdn, amount, currency = 'ZMW', externalId }: { msisdn: string; amount: number; currency?: string; externalId?: string }) {
  const token = await getToken();
  const reqId = `MTN-${crypto.randomBytes(6).toString('hex')}`;
  try {
    // Example POST to MTN Collection API – replace with real endpoint and headers
    // await fetch(`${process.env.MTN_MOMO_BASEURL}/collection/v1_0/requesttopay`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }})
    return { ok: true, requestId: reqId };
  } catch (err) {
    console.error('MTN create collection failed', err);
    throw err;
  }
}

export function verifyMtnSignature(raw: string | undefined, signature: string | undefined, secret?: string) {
  if (!raw || !signature || !secret) return false;
  const h = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return h === signature;
}

export default { createMtnCollection, getToken, verifyMtnSignature };
