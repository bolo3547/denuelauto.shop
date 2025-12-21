import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '../middleware/permissions';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('leads.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const leads = await prisma.lead.findMany({ where: { tenantId } });
  res.json(leads);
});

const createLeadSchema = z.object({
  carId: z.string().optional(),
  source: z.string().optional(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  country: z.string().optional(),
});

router.post('/', authMiddleware, requirePermission('leads.create'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createLeadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const lead = await prisma.lead.create({ data: { ...parsed.data, tenantId } as any });
  res.status(201).json(lead);
});

router.patch('/:id', authMiddleware, requirePermission('leads.update'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.lead.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Lead not found or access denied' });
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: req.body });
  res.json(lead);
});

export default router;
