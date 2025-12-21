import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';
import { z } from 'zod';
import cryptoService from '../services/crypto';

const prisma = new PrismaClient();
const router = Router();

const updateSchema = z.object({ cardJson: z.any().optional(), paypalJson: z.any().optional(), momoJson: z.any().optional() });

// GET /admin/payments/providers
router.get('/payments/providers', authMiddleware, requirePermission('payments.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const p = await prisma.paymentProvider.findUnique({ where: { tenantId } });
  // mask sensitive tokens
  if (!p) return res.json({});
  // decrypt vendor config if it's stored encrypted in JSON form
  const build = (x: any) => {
    if (!x) return undefined;
    try {
      // providerJson may be an object with nested providers or a provider-specific encrypted object
      if (typeof x === 'object' && x.encrypted) return cryptoService.maskSecrets(cryptoService.decryptJSON(x.encrypted));
    } catch (e) { }
    // fallback - maybe already clear object
    return cryptoService.maskSecrets(x);
  };
  // providerJson holds an object with card/paypal/momo nested or a flat json
  const providerJson = (p as any)?.providerJson || {};
  const masked = { ...p, cardJson: build(providerJson.card), paypalJson: build(providerJson.paypal), momoJson: build(providerJson.momo) };
  res.json(masked);
});

// PUT /admin/payments/providers -> step-up required
router.put('/payments/providers', authMiddleware, requirePermission('payments.verify'), requireStepUp, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  // encrypt configs for storage
  const encryptObj = (o: any) => (o ? { encrypted: cryptoService.encryptJSON(o) } : undefined);
  const providerObj: any = {};
  if (parsed.data.cardJson) providerObj.card = parsed.data.cardJson;
  if (parsed.data.paypalJson) providerObj.paypal = parsed.data.paypalJson;
  if (parsed.data.momoJson) providerObj.momo = parsed.data.momoJson;
  const up = await prisma.paymentProvider.upsert({ where: { tenantId }, update: { providerJson: encryptObj(providerObj) } as any, create: { tenantId, providerJson: encryptObj(providerObj) } as any });
  await prisma.auditLog.create({ data: { actorType: (req as any).user?.role || 'admin', actorId: (req as any).user?.id || 'system', tenantId, action: 'payments.providers.update', entity: 'paymentProvider' } as any });
  res.json(up);
});

export default router;
