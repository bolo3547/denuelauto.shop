import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const agents = await prisma.agent.findMany({ where: { tenantId } });
  res.json(agents);
});

const createAgentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  commissionPercent: z.number().optional(),
  portalAccess: z.boolean().optional(),
  referralCode: z.string().optional(),
});

router.post('/', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createAgentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const referral = parsed.data.referralCode || `AG${Math.floor(Math.random() * 90000) + 10000}`;
  const agent = await prisma.agent.create({ data: { ...parsed.data, tenantId, referralCode: referral } as any });
  res.status(201).json(agent);
});

router.patch('/:id', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.agent.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Agent not found or access denied' });
  const agent = await prisma.agent.update({ where: { id: req.params.id }, data: req.body });
  res.json(agent);
});

// POST /admin/agents/:id/statement -> aggregate locked commissions for month
router.post('/:id/statement', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const agentId = req.params.id;
  const month = req.body.month; // expect 'YYYY-MM'
  if (!month) return res.status(400).json({ error: 'month required' });
  const start = new Date(month + '-01');
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const deals = await prisma.agentDeal.findMany({ where: { tenantId, agentId, locked: true, updatedAt: { gte: start, lt: end } } });
  const totalUsd = deals.reduce((s: number, d: any) => s + Number(d.commissionAmount || 0), 0);
  const statement = await prisma.commissionStatement.create({ data: { tenantId, agentId, month, totalAmountUsd: totalUsd } as any });
  res.status(201).json(statement);
});

export default router;

// PATCH /admin/commission-statements/:id -> mark issued/paid
router.patch('/commission-statements/:id', authMiddleware, requirePermission('agents.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.commissionStatement.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.commissionStatement.update({ where: { id: req.params.id }, data: { status: req.body.status } as any });
  res.json(updated);
});
