import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('proformas.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const pf = await prisma.proformaInvoice.findMany({ where: { tenantId } });
  res.json(pf);
});

const createProformaSchema = z.object({
  carId: z.string(),
  buyerId: z.string().optional(),
  agentId: z.string().optional(),
  number: z.string(),
  currency: z.string(),
  lineItemsJson: z.any(),
  total: z.number(),
  status: z.string().optional(),
});

router.post('/', authMiddleware, requirePermission('proformas.create'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createProformaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  // ensure car, buyer, agent (if set) belong to tenant
  const car = await prisma.car.findFirst({ where: { id: parsed.data.carId, tenantId } });
  if (!car) return res.status(404).json({ error: 'Car not found or not in tenant' });
  if (parsed.data.buyerId) {
    const buyer = await prisma.buyer.findFirst({ where: { id: parsed.data.buyerId, tenantId } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found or not in tenant' });
  }
  if (parsed.data.agentId) {
    const agent = await prisma.agent.findFirst({ where: { id: parsed.data.agentId, tenantId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found or not in tenant' });
  }
  const pf = await prisma.proformaInvoice.create({ data: { ...parsed.data, tenantId, status: parsed.data.status || 'sent' } as any });
  res.status(201).json(pf);
});

router.patch('/:id', authMiddleware, requirePermission('proformas.update'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Proforma not found or access denied' });
  const pf = await prisma.proformaInvoice.update({ where: { id: req.params.id }, data: req.body });
  res.json(pf);
});

export default router;
