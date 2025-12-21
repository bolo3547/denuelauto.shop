import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createSchema = z.object({
  leadId: z.string().optional(),
  ownerName: z.string(),
  phone: z.string().optional(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  mileageKm: z.number().optional(),
  photosJson: z.any().optional(),
  appraisalZmw: z.number().optional(),
});

router.get('/', authMiddleware, requirePermission('tradeins.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const items = await prisma.tradeIn.findMany({ where: { tenantId } });
  res.json(items);
});

router.post('/', authMiddleware, requirePermission('tradeins.create'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const ti = await prisma.tradeIn.create({ data: { ...parsed.data, tenantId, status: 'new' } as any });
  res.status(201).json(ti);
});

router.patch('/:id', authMiddleware, requirePermission('tradeins.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.tradeIn.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.tradeIn.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

export default router;
