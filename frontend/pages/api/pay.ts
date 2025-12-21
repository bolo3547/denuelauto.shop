// This file contains payment API route handlers for Zambia's top banks and mobile money providers.
// Each handler is a stub for now, ready for integration with real payment APIs.

import type { NextApiRequest, NextApiResponse } from 'next';

// Example: Initiate payment
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { provider, amount, buyer, car } = req.body;

  // TODO: Integrate with real payment APIs for each provider
  switch (provider) {
    case 'zanaco':
      // Call ZANACO payment API here
      return res.status(200).json({ status: 'pending', message: 'ZANACO payment initiated (stub)' });
    case 'fnb':
      // Call FNB payment API here
      return res.status(200).json({ status: 'pending', message: 'FNB payment initiated (stub)' });
    case 'airtel':
      // Call Airtel Money API here
      return res.status(200).json({ status: 'pending', message: 'Airtel Money payment initiated (stub)' });
    case 'mtn':
      // Call MTN Mobile Money API here
      return res.status(200).json({ status: 'pending', message: 'MTN Mobile Money payment initiated (stub)' });
    case 'zamtel':
      // Call Zamtel Money API here
      return res.status(200).json({ status: 'pending', message: 'Zamtel Money payment initiated (stub)' });
    case 'zedmobile':
      // Call Zed Mobile API here
      return res.status(200).json({ status: 'pending', message: 'Zed Mobile payment initiated (stub)' });
    default:
      return res.status(400).json({ error: 'Unknown payment provider' });
  }
}
