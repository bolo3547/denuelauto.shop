import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';
import billingService from '../services/billing.service';
import featureFlags from '../middleware/featureFlags';
import paymentGateway from '../services/payment.gateway';

const prisma = new PrismaClient();
const router = Router();

// POST /subscribe
router.post('/subscribe', authMiddleware, requirePermission('payments.verify'), requireStepUp, featureFlags.requireFeature('billing.enabled'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { planKey, provider } = req.body;
  const sub = await billingService.createSubscription(tenantId, provider || 'stripe', planKey);
  await prisma.auditLog.create({ data: { actorType: (req as any).user?.role || 'admin', actorId: (req as any).user?.id || 'system', tenantId, action: 'billing.subscribe', entity: 'billingSubscription', entityId: sub.id } as any });
  res.json(sub);
});

// POST /cancel
router.post('/cancel', authMiddleware, requirePermission('payments.verify'), requireStepUp, featureFlags.requireFeature('billing.enabled'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { subscriptionId } = req.body;
  const sub = await billingService.cancelSubscription(tenantId, subscriptionId);
  await prisma.auditLog.create({ data: { actorType: (req as any).user?.role || 'admin', actorId: (req as any).user?.id || 'system', tenantId, action: 'billing.cancel', entity: 'billingSubscription', entityId: sub.id } as any });
  res.json(sub);
});

// GET /entitlements
router.get('/entitlements', authMiddleware, requirePermission('payments.read'), featureFlags.requireFeature('billing.enabled'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const ent = await billingService.getEntitlements(tenantId);
  res.json(ent);
});

// POST /webhooks/:provider -> public webhook (idempotent)
router.post('/webhooks/:provider', async (req: Request, res: Response) => {
  const provider = req.params.provider;
  const tenantId = (req.headers['x-tenant-id'] || req.body.tenant_id) as string | undefined;
  if (!tenantId) return res.status(400).json({ error: 'tenantId required in webhook' });
  const signature = req.headers['x-signature'] as string | undefined;
  const eventId = req.body.id || req.body.eventId || `${provider}-${Date.now()}`;
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  // dedupe & verify via paymentGateway
  const v = await paymentGateway.verifyAndRecordWebhook(tenantId, provider, eventId, signature, raw);
  if (!v.ok && v.duplicate) return res.json({ ok: true, duplicate: true });
  if (!v.ok) return res.status(400).json({ error: 'invalid webhook' });
  // handle billing events
  await billingService.handleBillingWebhook(tenantId, provider, req.body);
  res.json({ ok: true });
});

export default router;
