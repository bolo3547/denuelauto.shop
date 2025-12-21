import express from 'express';
import { PrismaClient } from '@prisma/client';
import airtelClient from '../services/airtel.client';
import { recordAudit } from '../services/audit.service';
import { verifyHmac } from '../services/crypto';
import orderService from '../services/order.service';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/payments/airtel/collect
router.post('/payments/airtel/collect', async (req, res) => {
  const { msisdn, amount, currency = 'ZMW', externalRef } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'tenant missing' });
  // check idempotency
  if (idempotencyKey) {
    const existing = await prisma.mobilePayment.findFirst({ where: { tenantId, idempotencyKey } });
    if (existing) return res.json({ ok: true, request_id: existing.requestId, idempotent: true });
  }
  const { requestId } = await airtelClient.createAirtelCollection({ msisdn, amount, currency, externalId: externalRef });
  const mp = await prisma.mobilePayment.create({ data: { tenantId, msisdn, provider: 'airtel', amount, currency, requestId, status: 'pending', idempotencyKey, externalRef } as any });
  await recordAudit({ tenantId, action: 'airtel.collect', after: mp });
  res.json({ ok: true, request_id: requestId });
});

router.post('/webhooks/airtel-money', async (req, res) => {
  const signature = req.headers['x-signature'] as string | undefined;
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  // Use Airtel client's verify function (if any) otherwise use default HMAC
  if (!airtelClient.verifyAirtelSignature(raw, signature, process.env.AIRTEL_SIGNING_SECRET || process.env.USSD_SIGNING_SECRET)) return res.status(401).json({ error: 'invalid signature' });
  const event = req.body;
  const mp = await prisma.mobilePayment.findFirst({ where: { requestId: event.request_id } });
  if (!mp) return res.status(404).json({ error: 'payment not found' });
  if (mp.status === 'approved' && event.status === 'success') return res.json({ ok: true, duplicate: true });
  const updated = await prisma.mobilePayment.update({ where: { id: mp.id }, data: { status: event.status === 'success' ? 'approved' : 'failed', metaJson: event } });
  if (updated.status === 'approved') {
    const cart = await prisma.ussdCart.findFirst({ where: { tenantId: mp.tenantId, msisdn: mp.msisdn, status: 'held' } });
    if (cart) {
      const result = await orderService.createOrderFromCart(mp.tenantId, cart, updated);
      const receiptMsg = `Denuel: ZMW ${mp.amount} received for ${cart.stockNo}. Ref ${result.order.ref}.`;
      import('../services/queues').then(({ receiptQueue, receiptDLQ }) => {
        receiptQueue.add('sms', { to: mp.msisdn, message: receiptMsg, paymentId: updated.id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
      }).catch(e => console.error(e));
    }
  }
  await recordAudit({ tenantId: mp.tenantId, action: 'airtel.webhook', before: mp, after: updated });
  res.json({ ok: true });
});

export default router;
