import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const holdSchema = z.object({ amountUsd: z.number().optional(), hours: z.number().optional() });

// POST /buyer/cars/:id/hold
router.post('/cars/:id/hold', authMiddleware, async (req: Request, res: Response) => {
  const parsed = holdSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Bad request' });
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const carId = req.params.id;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  let holdHours = 48;
  if (tenant?.settings && typeof tenant.settings === 'object' && tenant.settings !== null) {
    const settingsObj = tenant.settings as any;
    holdHours = Number(settingsObj?.checkout?.hold_hours) || 48;
  }
  const hours = parsed.data.hours || holdHours;
  const expiresAt = new Date(Date.now() + (hours * 60 * 60 * 1000));
  const hold = await prisma.hold.create({ data: { tenantId, carId, buyerId: userId, amountUsd: parsed.data.amountUsd || 0, expiresAt, status: 'active' } as any });
  // update car status to reserved
  await prisma.car.updateMany({ where: { id: carId, tenantId, status: 'published' }, data: { status: 'reserved' } });
  res.status(201).json(hold);
});

// GET /admin/holds - list holds (RBAC)
router.get('/admin/holds', authMiddleware, requirePermission('payments.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const holds = await prisma.hold.findMany({ where: { tenantId } });
  res.json(holds);
});

// POST /admin/holds/:id/release - release hold to available or convert
router.post('/admin/holds/:id/release', authMiddleware, requirePermission('payments.verify'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const h = await prisma.hold.findFirst({ where: { id: req.params.id, tenantId } });
  if (!h) return res.status(404).json({ error: 'Hold not found' });
  const updated = await prisma.hold.update({ where: { id: req.params.id }, data: { status: 'released' } });
  // set car back to published if reserved
  await prisma.car.updateMany({ where: { id: h.carId, tenantId, status: 'reserved' }, data: { status: 'published' } });
  res.json(updated);
});

// POST /admin/holds/expire -> release all expired holds
router.post('/admin/holds/expire', authMiddleware, requirePermission('payments.verify'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const now = new Date();
  const expired = await prisma.hold.findMany({ where: { tenantId, status: 'active', expiresAt: { lte: now } } });
  for (const h of expired) {
    await prisma.hold.update({ where: { id: h.id }, data: { status: 'released' } as any });
    await prisma.car.updateMany({ where: { id: h.carId, tenantId, status: 'reserved' }, data: { status: 'published' } });
  }
  res.json({ released: expired.length });
});

export default router;
