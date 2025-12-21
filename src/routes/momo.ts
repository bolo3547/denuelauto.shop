import express from 'express';
import { PrismaClient } from '@prisma/client';
import mtnClient from '../services/mtn.client';
import orderService from '../services/order.service';
import { recordAudit } from '../services/audit.service';
import { verifyHmac } from '../services/crypto';
 

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/payments/mtn/collect
router.post('/payments/mtn/collect', async (req, res) => {
  const { msisdn, amount, currency = 'ZMW', externalRef } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'tenant missing' });
  // handle idempotency
  if (idempotencyKey) {
    const existing = await prisma.mobilePayment.findFirst({ where: { tenantId, idempotencyKey } });
    if (existing) return res.json({ ok: true, request_id: existing.requestId, idempotent: true });
  }
  const { requestId } = await mtnClient.createMtnCollection({ msisdn, amount, currency, externalId: externalRef });
  const mp = await prisma.mobilePayment.create({ data: { tenantId, msisdn, provider: 'mtn', amount, currency, requestId, status: 'pending', idempotencyKey, externalRef: externalRef } as any });
  await recordAudit({ tenantId, action: 'mtn.collect', after: mp });
  res.json({ ok: true, request_id: requestId });
});

// POST /api/webhooks/mtn-momo
router.post('/webhooks/mtn-momo', async (req, res) => {
  const signature = req.headers['x-signature'] as string | undefined;
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  // Use MTN client verification for content if available
  if (!mtnClient.verifyMtnSignature(raw, signature, process.env.MTN_MOMO_SIGNING_SECRET || process.env.USSD_SIGNING_SECRET)) return res.status(401).json({ error: 'invalid signature' });
  const event = req.body;
  // find mobile payment by requestId
  const mp = await prisma.mobilePayment.findFirst({ where: { requestId: event.request_id } });
  if (!mp) return res.status(404).json({ error: 'payment not found' });
  // idempotent update
  if (mp.status === 'approved' && event.status === 'success') return res.json({ ok: true, duplicate: true });
  const updated = await prisma.mobilePayment.update({ where: { id: mp.id }, data: { status: event.status === 'success' ? 'approved' : 'failed', metaJson: event } });
  // if approved, convert cart to order & proforma
  if (updated.status === 'approved') {
    const cart = await prisma.ussdCart.findFirst({ where: { tenantId: mp.tenantId, msisdn: mp.msisdn, status: 'held' } });
    if (cart) {
      const result = await orderService.createOrderFromCart(mp.tenantId, cart, updated);
      // queue SMS / WhatsApp via background job - for now we log and create receipt
      const receiptMsg = `Denuel: ZMW ${mp.amount} received for ${cart.stockNo}. Ref ${result.order.ref}.`;
      // enqueue SMS
      import('../services/queues').then(({ receiptQueue, receiptDLQ }) => {
        // enqueue with attempts and backoff
        receiptQueue.add('sms', { to: mp.msisdn, message: receiptMsg, paymentId: updated.id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
      }).catch(e => console.error(e));
    }
  }
  await recordAudit({ tenantId: mp.tenantId, action: 'mtn.webhook', before: mp, after: updated });
  res.json({ ok: true });
});

export default router;
