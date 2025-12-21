import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('quotes.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const quotes = await prisma.quote.findMany({ where: { tenantId } });
  res.json(quotes);
});

const createQuoteSchema = z.object({
  leadId: z.string(),
  carId: z.string(),
  currency: z.string(),
  price: z.number(),
  validUntil: z.string(),
});

router.post('/', authMiddleware, requirePermission('quotes.create'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createQuoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  // ensure referenced entities belong to tenant
  const car = await prisma.car.findFirst({ where: { id: parsed.data.carId, tenantId } });
  const lead = await prisma.lead.findFirst({ where: { id: parsed.data.leadId, tenantId } });
  if (!car || !lead) return res.status(404).json({ error: 'Referenced car or lead not found or not in this tenant' });
  const quote = await prisma.quote.create({ data: { ...parsed.data, tenantId, status: 'new' } });
  res.status(201).json(quote);
});

router.patch('/:id', authMiddleware, requirePermission('quotes.update'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.quote.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Quote not found or access denied' });
  const quote = await prisma.quote.update({ where: { id: req.params.id }, data: req.body });
  res.json(quote);
});

export default router;
