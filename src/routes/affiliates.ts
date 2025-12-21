import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createAffiliateSchema = z.object({ name: z.string(), payoutPct: z.number().optional(), status: z.string().optional() });

// POST /admin/affiliates - create
router.post('/admin/affiliates', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createAffiliateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const referral = `AFF${Math.floor(Math.random() * 90000) + 10000}`;
  const a = await prisma.affiliate.create({ data: { tenantId, name: parsed.data.name, payoutPct: parsed.data.payoutPct || 2.5, referralCode: referral, status: parsed.data.status || 'active' } as any });
  res.status(201).json(a);
});

// GET /admin/affiliates/payouts - return payouts (stub)
router.get('/admin/affiliates/payouts', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const payouts = await prisma.affiliatePayout.findMany({ where: { tenantId } });
  res.json(payouts);
});

// POST /admin/affiliates/:id/payout { month }
router.post('/admin/affiliates/:id/payout', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const affiliateId = req.params.id;
  const month = req.body.month; // 'YYYY-MM'
  if (!month) return res.status(400).json({ error: 'month required' });
  const start = new Date(month + '-01');
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  // naive calculation: count clicks leading to pays (assuming an order -> proforma paid within month)
  const clicks = await prisma.affiliateClick.findMany({ where: { tenantId, affiliateId, createdAt: { gte: start, lt: end } } });
  // naively compute: $10 per click as placeholder; proper logic should sum proformas assigned
  const amountUsd = clicks.length * 10;
  const payout = await prisma.affiliatePayout.create({ data: { tenantId, affiliateId, month, amountUsd } as any });
  res.status(201).json(payout);
});

export default router;
