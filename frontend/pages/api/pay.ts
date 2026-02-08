// Payment API route handler for Zambia's top banks and mobile money providers.
// Proxies to the backend payment service for real payment processing.

import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { provider, amount, buyer, car, tenantId, proformaId, phone } = req.body;

  if (!provider || !amount) {
    return res.status(400).json({ error: 'Provider and amount are required' });
  }

  // Route to the appropriate backend payment endpoint
  try {
    let backendUrl: string;
    let backendBody: Record<string, unknown>;

    switch (provider) {
      case 'airtel':
        backendUrl = `${API_BASE}/api/payments/airtel/collect`;
        backendBody = { amount, phone, tenantId, proformaId, currency: 'ZMW' };
        break;
      case 'mtn':
        backendUrl = `${API_BASE}/api/payments/mtn/collect`;
        backendBody = { amount, phone, tenantId, proformaId, currency: 'ZMW' };
        break;
      case 'zanaco':
      case 'fnb':
      case 'zamtel':
      case 'zedmobile':
        // Bank and other mobile money payments route through the generic payment gateway
        backendUrl = `${API_BASE}/api/payments/record`;
        backendBody = {
          amount,
          method: provider.toUpperCase(),
          tenantId,
          proformaId,
          buyerName: buyer?.name,
          buyerEmail: buyer?.email,
          carId: car?.id,
          currency: 'ZMW',
          status: 'PENDING',
        };
        break;
      default:
        return res.status(400).json({ error: 'Unknown payment provider' });
    }

    const authHeader = req.headers.authorization;
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      },
      body: JSON.stringify(backendBody),
    });

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (error) {
    console.error(`Payment proxy error for ${provider}:`, error instanceof Error ? error.message : 'Unknown error');
    return res.status(502).json({ error: 'Payment service unavailable' });
  }
}
