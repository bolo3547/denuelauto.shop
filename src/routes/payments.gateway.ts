import { Router, Request, Response } from 'express';
import paymentGateway from '../services/payment.gateway';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createSchema = z.object({ amount: z.number(), currency: z.string().optional(), provider: z.string().optional() });

router.post('/proformas/:id/pay/card', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const pi = await paymentGateway.createCardIntent(tenantId, req.params.id, userId, parsed.data.amount, parsed.data.currency || 'USD');
  res.json({ clientSecret: pi.clientSecret, intentId: pi.pi.id });
});

router.post('/proformas/:id/pay/paypal', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const pi = await paymentGateway.createPaypalIntent(tenantId, req.params.id, userId, parsed.data.amount, parsed.data.currency || 'USD');
  res.json({ approvalUrl: pi.approvalUrl, intentId: pi.pi.id });
});

router.post('/proformas/:id/pay/momo', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const pi = await paymentGateway.createMomoIntent(tenantId, req.params.id, userId, parsed.data.amount, parsed.data.currency || 'USD');
  res.json({ pollId: pi.pollId, intentId: pi.pi.id });
});

export default router;
