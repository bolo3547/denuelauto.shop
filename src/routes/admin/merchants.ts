import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/merchants', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const list = await prisma.merchant.findMany({ where: tenantId ? { tenantId } : {} });
  res.json({ ok: true, list });
});

router.post('/merchants', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const { tenantId: bodyTenantId, shortCode, name } = req.body;
  const tenantId = bodyTenantId || (req as any).tenantId || (req as any).user?.tenantId;
  if (!tenantId || !shortCode || !name) return res.status(400).json({ error: 'tenantId, shortCode and name required' });
  const row = await prisma.merchant.create({ data: { tenantId, shortCode, name, status: 'active' } as any });
  res.json({ ok: true, merchant: row });
});

router.delete('/merchants/:id', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const { id } = req.params;
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const row = await prisma.merchant.findFirst({ where: { id, tenantId } });
  if (!row) return res.status(404).json({ error: 'not found' });
  await prisma.merchant.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
