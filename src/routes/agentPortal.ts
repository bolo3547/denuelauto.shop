import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

// mount this at /t/:slug/agent (tenantResolver + must use authMiddleware returning role 'agent')
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const agent = await prisma.agent.findFirst({ where: { id: userId, tenantId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

router.get('/leads', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const deals = await prisma.agentDeal.findMany({ where: { tenantId, agentId: userId } });
  res.json(deals);
});

router.post('/leads/:id/note', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const lead = await prisma.lead.findFirst({ where: { id: req.params.id, tenantId } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  // For simplicity, save note as 'remarks' on lead
  const updated = await prisma.lead.update({ where: { id: lead.id }, data: { message: (lead.message || '') + `\n[Agent ${userId}] ${req.body.text}` } as any });
  res.json(updated);
});

router.post('/buyers', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const { name, email, phone, country, addressJson } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
  const b = await prisma.buyer.create({ data: { tenantId, name, email, phone, country, addressJson } as any });
  res.status(201).json(b);
});

// POST /agent/deals/:id/payment-proof
router.post('/deals/:id/payment-proof', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const deal = await prisma.agentDeal.findFirst({ where: { id: req.params.id, tenantId, agentId: userId } });
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  // create a payment with status 'pending'
  const payment = await prisma.payment.create({ data: { tenantId, ref: `PAY-DEAL-${deal.id}`, carId: deal.carId, buyerId: deal.buyerId, amount: deal.commissionAmount || 0, method: req.body.method || 'cash_agent', status: 'pending', currency: 'USD' } as any });
  res.json(payment);
});

router.get('/commissions', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const deals = await prisma.agentDeal.findMany({ where: { tenantId, agentId: userId, locked: true } });
  res.json(deals);
});

router.get('/referral-link', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const agent = await prisma.agent.findFirst({ where: { id: userId, tenantId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const host = process.env.NEXT_PUBLIC_SITE_URL || '';
  const link = `${host}/t/${(req as any).tenantSlug}/public/cars?agent=${agent.referralCode}`;
  res.json({ link });
});

// GET /agent/metrics/overview
router.get('/metrics/overview', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const newLeads = await prisma.lead.count({ where: { tenantId, assignedTo: userId, createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } });
  const activeDeals = await prisma.agentDeal.count({ where: { tenantId, agentId: userId, stage: { in: ['lead', 'quote', 'proforma', 'part_paid'] } } });
  const month = new Date().toISOString().slice(0, 7);
  const start = new Date(month + '-01');
  const end = new Date(start); end.setMonth(end.getMonth() + 1);
  const monthCommission = await prisma.agentDeal.aggregate({ where: { tenantId, agentId: userId, locked: true, lockedAt: { gte: start, lt: end } }, _sum: { commissionAmount: true } });
  const topModels = await prisma.agentDeal.groupBy({ by: ['carId'], where: { tenantId, agentId: userId }, _count: { carId: true }, orderBy: { _count: { carId: 'desc' } }, take: 5 });
  const topModelsResolved = await Promise.all(topModels.map(async (t: any) => { const c = await prisma.car.findUnique({ where: { id: t.carId } }); return { label: `${c?.make} ${c?.model}`, count: t._count.carId }; }));
  res.json({ newLeads, activeDeals, monthCommissionUsd: Number(monthCommission._sum.commissionAmount || 0), topModels: topModelsResolved });
});

export default router;
