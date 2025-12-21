import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const scheduleSchema = z.object({ carId: z.string(), name: z.string(), phone: z.string(), scheduleAt: z.string() });

router.post('/', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const td = await prisma.testDrive.create({ data: { tenantId, carId: parsed.data.carId, name: parsed.data.name, phone: parsed.data.phone, scheduleAt: new Date(parsed.data.scheduleAt), status: 'requested' } as any });
  res.status(201).json(td);
});

router.patch('/:id', authMiddleware, requirePermission('testDrives.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.testDrive.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.testDrive.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.get('/', authMiddleware, requirePermission('testDrives.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const items = await prisma.testDrive.findMany({ where: { tenantId } });
  res.json(items);
});

export default router;
