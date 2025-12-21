import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

// POST /admin/shipments/:id/timeline
router.post('/admin/shipments/:id/timeline', authMiddleware, requirePermission('shipments.*'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { status_key, note } = req.body;
  const shipmentId = req.params.id;
  if (!status_key) return res.status(400).json({ error: 'status_key required' });
  const event = await prisma.shippingTimeline.create({ data: { tenantId, shipmentId, statusKey: status_key, happenedAt: new Date(), note } as any });
  res.status(201).json(event);
});

// GET /buyer/shipments/:id/timeline
router.get('/buyer/shipments/:id/timeline', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const shipmentId = req.params.id;
  const events = await prisma.shippingTimeline.findMany({ where: { tenantId, shipmentId }, orderBy: { happenedAt: 'asc' } });
  res.json(events);
});

export default router;
