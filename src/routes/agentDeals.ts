import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createDealSchema = z.object({
  agentId: z.string(),
  carId: z.string(),
  buyerId: z.string().optional(),
  stage: z.string().optional(), // 'lead','quote','proforma','paid','shipped','closed'
  commissionPercent: z.number().optional(),
});

router.get('/', authMiddleware, requirePermission('deals.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const deals = await prisma.agentDeal.findMany({ where: { tenantId } });
  res.json(deals);
});

router.post('/', authMiddleware, requirePermission('deals.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createDealSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });

  // ensure agent and car belong to tenant
  const agent = await prisma.agent.findFirst({ where: { id: parsed.data.agentId, tenantId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const car = await prisma.car.findFirst({ where: { id: parsed.data.carId, tenantId } });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  if (parsed.data.buyerId) {
    const buyer = await prisma.buyer.findFirst({ where: { id: parsed.data.buyerId, tenantId } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
  }

  const deal = await prisma.agentDeal.create({ data: { ...parsed.data, tenantId, commissionPercent: parsed.data.commissionPercent ?? agent.commissionPercent ?? 0 } as any });
  res.status(201).json(deal);
});

router.patch('/:id', authMiddleware, requirePermission('deals.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.agentDeal.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Deal not found or access denied' });

  // update stage and compute commission when moving to 'paid' or 'closed'
  const data = req.body;
  const updated = await prisma.agentDeal.update({ where: { id: req.params.id }, data });

  // commission lock config - default to 'in_transit'
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const lockStage = (tenant?.settings as any)?.agent?.commission_lock_stage || 'in_transit';
  if (data.stage === lockStage || (data.stage && ['paid', 'closed'].includes(data.stage))) {
    // find an amount to calculate commission on: prefer proforma (if any), else quote, else car.priceUsd or priceLocalZmw
    let amountUsd: number | null = null;
    try {
      const pf = await prisma.proformaInvoice.findFirst({ where: { tenantId, carId: existing.carId }, orderBy: { createdAt: 'desc' } });
      if (pf && pf.total) amountUsd = Number(pf.total);
      if (amountUsd == null) {
        const quote = await prisma.quote.findFirst({ where: { tenantId, carId: existing.carId }, orderBy: { createdAt: 'desc' } });
        if (quote && quote.price) amountUsd = Number(quote.price);
      }
      if (amountUsd == null) {
        const car = await prisma.car.findFirst({ where: { id: existing.carId, tenantId } });
        if (car?.priceUsd) amountUsd = Number(car.priceUsd);
      }
      const agentRec = await prisma.agent.findUnique({ where: { id: existing.agentId } });
      const pct = Number(existing.commissionPercent || agentRec?.commissionPercent || 0);
      const commission = amountUsd != null ? Math.round((pct / 100) * amountUsd * 100) / 100 : 0;
      await prisma.agentDeal.update({ where: { id: req.params.id }, data: { commissionAmount: commission, locked: true, lockedAt: new Date() } as any });
    } catch (err) {
      console.error('Failed to compute commission', err);
    }
  }

  res.json(updated);
});

export default router;
