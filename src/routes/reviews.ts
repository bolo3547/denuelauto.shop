import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createReviewSchema = z.object({ carId: z.string(), rating: z.number().min(1).max(5), text: z.string().optional() });

// POST /buyer/reviews
router.post('/reviews', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  // simple check: buyer has a proforma or payment for the car
  const pf = await prisma.proformaInvoice.findFirst({ where: { tenantId, carId: parsed.data.carId, userId: userId } });
  if (!pf) return res.status(403).json({ error: 'Only buyers of this car can review' });
  const r = await prisma.review.create({ data: { tenantId, carId: parsed.data.carId, buyerId: userId, rating: parsed.data.rating, text: parsed.data.text, status: 'pending' } as any });
  res.status(201).json(r);
});

// GET /public/reviews
router.get('/public/reviews', async (req: Request, res: Response) => {
  const tenantId = req.query.tenantId as string | undefined;
  const carId = req.query.carId as string | undefined;
  const where: any = { status: 'published' };
  if (tenantId) where.tenantId = tenantId;
  if (carId) where.carId = carId;
  const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(reviews);
});

// POST /admin/reviews/:id/moderate { status }
router.patch('/admin/reviews/:id/moderate', authMiddleware, requirePermission('reviews.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.review.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.review.update({ where: { id: req.params.id }, data: { status: req.body.status } as any });
  res.json(updated);
});

export default router;
