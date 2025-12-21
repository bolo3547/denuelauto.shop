import express from 'express';
import { PrismaClient } from '@prisma/client';
import africasTalking from '../services/africasTalking.client';
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/receipts/sms
router.post('/receipts/sms', async (req, res) => {
  const { paymentId, to, message } = req.body;
  if (!paymentId || !to || !message) return res.status(400).json({ error: 'missing fields' });
  try {
    const s = await africasTalking.sendSms(to, message);
    await prisma.receipt.create({ data: { paymentId, message, channel: 'sms', deliveredAt: new Date() } as any });
    res.json({ ok: true, send: s });
  } catch (err) {
    res.status(500).json({ error: 'send failed' });
  }
});

export default router;
