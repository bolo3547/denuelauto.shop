import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// GET /admin/fx-settings
router.get('/admin/fx-settings', authMiddleware, requirePermission('analytics.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const fx = await prisma.fxSetting.findUnique({ where: { tenantId } });
  res.json(fx);
});

const updateSchema = z.object({ usdToLocal: z.number(), minMarginPct: z.number() });
// PUT /admin/fx-settings
router.put('/admin/fx-settings', authMiddleware, requirePermission('analytics.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  await prisma.fxSetting.upsert({ where: { tenantId }, update: { usdToLocal: parsed.data.usdToLocal, minMarginPct: parsed.data.minMarginPct } as any, create: { tenantId, usdToLocal: parsed.data.usdToLocal, minMarginPct: parsed.data.minMarginPct } as any });
  const fx = await prisma.fxSetting.findUnique({ where: { tenantId } });
  res.json(fx);
});

export default router;
