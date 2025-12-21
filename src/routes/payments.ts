import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';
import { z } from 'zod';
import { writeRateLimiter } from '../middleware/rateLimit';
import crypto from 'crypto';
import paymentService from '../services/payment.service';
import paymentGateway from '../services/payment.gateway';
import express from 'express';
import { verifyHmac } from '../services/crypto';
import { generateReceipt } from '../services/print.service';
import { recordAudit } from '../services/audit.service';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('payments.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const payments = await prisma.payment.findMany({ where: { tenantId } });
  res.json(payments);
});

const createPaymentSchema = z.object({
  ref: z.string(),
  carId: z.string().optional(),
  proformaId: z.string().optional(),
  buyerId: z.string().optional(),
  agentId: z.string().optional(),
  method: z.string(),
  currency: z.string(),
  amount: z.number(),
  proofUrl: z.string().optional(),
});

router.post('/record', writeRateLimiter, authMiddleware, requirePermission('payments.record'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  // verify referenced ids belong to tenant
  if (parsed.data.carId) {
    const car = await prisma.car.findFirst({ where: { id: parsed.data.carId, tenantId } });
    if (!car) return res.status(404).json({ error: 'Car not found or not in tenant' });
  }
  if (parsed.data.proformaId) {
    const pf = await prisma.proformaInvoice.findFirst({ where: { id: parsed.data.proformaId, tenantId } });
    if (!pf) return res.status(404).json({ error: 'Proforma not found or not in tenant' });
  }
  if (parsed.data.buyerId) {
    const buyer = await prisma.buyer.findFirst({ where: { id: parsed.data.buyerId, tenantId } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found or not in tenant' });
  }
  // compute hash for integrity
  const hashInput = `${tenantId}:${parsed.data.ref}:${parsed.data.amount}:${Date.now()}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  const paymentData: any = {
    ...parsed.data,
    tenantId,
    hash,
  };
  if (parsed.data.carId) paymentData.carId = parsed.data.carId;
  if (parsed.data.buyerId) paymentData.buyerId = parsed.data.buyerId;
  if (parsed.data.agentId) paymentData.agentId = parsed.data.agentId;
  if (parsed.data.proformaId) paymentData.proformaId = parsed.data.proformaId;
  if (parsed.data.proofUrl) paymentData.proofUrl = parsed.data.proofUrl;

  const payment = await prisma.payment.create({
    data: paymentData as any
  });
  res.status(201).json(payment);
});

router.patch('/:id/verify', authMiddleware, requirePermission('payments.verify'), requireStepUp, async (req: Request, res: Response) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  if (payment.tenantId !== tenantId) return res.status(403).json({ error: 'Forbidden' });
  const before = payment;
  const updated = await prisma.payment.update({ where: { id: req.params.id }, data: { status: req.body.status || 'verified' } });
  // Update proforma status based on verified sums
  if (updated.proformaId) {
    const paymentsSum = await prisma.payment.aggregate({ where: { proformaId: updated.proformaId, status: 'verified' }, _sum: { amount: true } });
      const proforma = await prisma.proformaInvoice.findUnique({ where: { id: updated.proformaId } });
    if (proforma) {
      const verifiedAmount = Number(paymentsSum._sum.amount ?? 0);
      const newStatus = verifiedAmount >= Number(proforma.total) ? 'paid' : 'part_paid';
      const beforePf = { ...proforma };
        const pfUpdated = await prisma.proformaInvoice.update({ where: { id: proforma.id }, data: { status: newStatus } });
      // generate receipt
      const receipt = await generateReceipt(updated.id);
      await recordAudit({ tenantId, actorId: (req as any).user?.id ?? 'system', action: 'payment.verify', before: { payment: before, proforma: beforePf }, after: { payment: updated, proforma: pfUpdated }, meta: { receiptUrl: receipt.url } });
    }
  }
  res.json(updated);
});

// POST /payments/webhooks/:provider -> handle provider events (card, paypal)
router.post('/webhooks/:provider', async (req: Request, res: Response) => {
  const provider = req.params.provider;
  // In real production, verify signature using shared secret configured for tenant
  // Here accept a header X-SIGNATURE for minimal verification
  try {
    const body = req.body;
    const tenantId = (req as any).tenantId || (req.headers['x-tenant-id'] as string);
    if (!body || !body.event || !body.data) return res.status(400).json({ error: 'Invalid event' });
    const signature = req.headers['x-signature'] as string | undefined;
    const eventId = body.id || body.eventId || `${provider}-${Date.now()}`;
    // raw string for verification; prefer req.rawBody when available
    const raw = (req as any).rawBody || JSON.stringify(req.body);
    const v = await paymentGateway.verifyAndRecordWebhook(tenantId ?? '', provider, eventId, signature, raw);
    if (!v.ok && v.duplicate) return res.json({ ok: true, duplicate: true });
    if (!v.ok && !v.duplicate) return res.status(400).json({ error: 'webhook signature invalid or event deduped' });
    const event = body.event;
    if (event === 'payment_succeeded' || event === 'payment.completed' || event === 'intent.succeeded') {
      const intentId = body.data.intentId || body.data.id;
      const pi = await prisma.paymentIntent.findUnique({ where: { id: intentId } });
      if (!pi) return res.status(404).json({ error: 'Intent not found' });
      // idempotency: skip if already succeeded
      if (pi.status === 'succeeded') return res.json({ ok: true });
      const p = await paymentService.markIntentSucceeded(pi.id, body);
      // mark webhook event processed for audit
      const eventId = body.id || body.eventId || `${provider}-${Date.now()}`;
      await prisma.webhookEvent.updateMany({ where: { eventId }, data: { processed: true } }).catch(() => null);
      // Log audit
      await prisma.auditLog.create({ data: { actorType: 'system', actorId: 'system', tenantId: pi.tenantId, action: 'payment.verified', entity: 'payment', entityId: (p as any).id } });
      return res.json({ ok: true });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).json({ error: 'webhook processing error' });
  }
});

// Middleware to validate tenant ID
router.use((req, res, next) => {
  const tenantIdHeader = req.headers['x-tenant-id'];
  if (!tenantIdHeader) {
    return res.status(400).json({ error: 'Tenant ID is required.' });
  }
  const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;
  (req as any).tenantId = tenantId as string;
  next();
});

// Buyer: Create payment intent for Card
router.post('/buyer/proformas/:id/pay/card', async (req, res) => {
  const { id } = req.params;
  const { amount, currency } = req.body;

  try {
    const proforma = await prisma.proformaInvoice.findUnique({ where: { id } });
    if (!proforma) {
      return res.status(404).json({ error: 'Proforma not found.' });
    }

    if (!req.tenantId || typeof req.tenantId !== 'string') {
      return res.status(400).json({ error: 'Tenant ID is required.' });
    }
    const intent = await prisma.paymentIntent.create({
      data: {
        tenantId: req.tenantId as string,
        proformaId: id,
        provider: 'card',
        currency,
        amount,
        status: 'requires_action',
      },
    });

    res.json({ client_secret: intent.clientSecret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Buyer: Create payment intent for PayPal
router.post('/buyer/proformas/:id/pay/paypal', async (req, res) => {
  const { id } = req.params;
  const { amount, currency } = req.body;

  try {
    const proforma = await prisma.proformaInvoice.findUnique({ where: { id } });
    if (!proforma) {
      return res.status(404).json({ error: 'Proforma not found.' });
    }

    if (!req.tenantId || typeof req.tenantId !== 'string') {
      return res.status(400).json({ error: 'Tenant ID is required.' });
    }
    const intent = await prisma.paymentIntent.create({
      data: {
        tenantId: req.tenantId as string,
        proformaId: id,
        provider: 'paypal',
        currency,
        amount,
        status: 'pending'
      },
    });

    // If you need approvalUrl, you can mock it here for the response
    res.json({ approval_url: 'https://paypal.com/approval-url' });
  } catch (error) {
    console.error('Error creating PayPal intent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Buyer: Create payment intent for Mobile Money
router.post('/buyer/proformas/:id/pay/momo', async (req, res) => {
  const { id } = req.params;
  const { amount, currency } = req.body;

  try {
    const proforma = await prisma.proformaInvoice.findUnique({ where: { id } });
    if (!proforma) {
      return res.status(404).json({ error: 'Proforma not found.' });
    }

    if (!req.tenantId || typeof req.tenantId !== 'string') {
      return res.status(400).json({ error: 'Tenant ID is required.' });
    }
    const intent = await prisma.paymentIntent.create({
      data: {
        tenantId: req.tenantId as string,
        proformaId: id,
        provider: 'momo',
        currency,
        amount,
      },
    });

    res.json({ poll_url: `/buyer/payments/${intent.id}/status` });
  } catch (error) {
    console.error('Error creating MoMo intent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Buyer: Poll payment status for MoMo
router.get('/buyer/payments/:intentId/status', async (req, res) => {
  const { intentId } = req.params;

  try {
    const intent = await prisma.paymentIntent.findUnique({ where: { id: intentId }, select: { status: true } as any });
    if (!intent) {
      return res.status(404).json({ error: 'Payment intent not found.' });
    }

    res.json({ status: (intent as any).status });
  } catch (error) {
    console.error('Error polling payment status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Webhooks: Handle payment provider notifications
router.post('/payments/webhooks/:provider', async (req, res) => {
  const { provider } = req.params;
  const signatureHeader = req.headers['x-signature'];
  const signature = Array.isArray(signatureHeader) ? signatureHeader.join(',') : signatureHeader;

  try {
    const isValid = verifyHmac(req.rawBody, signature, process.env.WEBHOOK_SECRET);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(req.rawBody ?? '{}');

    if (event.status === 'succeeded') {
      const payment = await prisma.payment.create({
        data: {
          tenantId: typeof req.tenantId === 'string' ? req.tenantId : '',
          proformaId: event.proformaId,
          method: provider,
          currency: event.currency,
          amount: event.amount,
          status: 'verified',
          ref: event.ref ?? `webhook-${Date.now()}`,
          hash: crypto.createHash('sha256').update(`${req.tenantId}:${event.ref ?? `webhook-${Date.now()}`}:${event.amount}:${Date.now()}`).digest('hex'),
        },
      });

      await prisma.proformaInvoice.update({
        where: { id: event.proformaId },
        data: { status: 'part_paid' },
      });

      await generateReceipt(payment.id);
      await recordAudit({ tenantId: req.tenantId ?? '', actorId: 'system', action: 'payment.webhook', after: payment, meta: { provider, event } });
    }

    res.status(200).json({ message: 'Webhook processed successfully.' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
