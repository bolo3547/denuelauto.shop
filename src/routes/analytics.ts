import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/analytics/overview', authMiddleware, requirePermission('analytics.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const totalCars = await prisma.car.count({ where: { tenantId } });
  const publishedCars = await prisma.car.count({ where: { tenantId, publishToPublic: true } });
  const leads = await prisma.lead.count({ where: { tenantId } });
  const payments = await prisma.payment.aggregate({ where: { tenantId }, _sum: { amount: true } });
  res.json({ totals: { totalCars, publishedCars, leads, revenue: payments._sum.amount || 0 } });
});

export default router;
