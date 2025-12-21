import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/ussd-channels', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const list = await prisma.ussdChannel.findMany({ where: tenantId ? { tenantId } : {} });
  res.json({ ok: true, list });
});

router.post('/ussd-channels', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const { tenantId: bodyTenantId, shortcode } = req.body;
  const tenantId = bodyTenantId || (req as any).tenantId || (req as any).user?.tenantId;
  if (!tenantId || !shortcode) return res.status(400).json({ error: 'tenantId and shortcode required' });
  const row = await prisma.ussdChannel.create({ data: { tenantId, shortcode } as any });
  res.json({ ok: true, channel: row });
});

router.delete('/ussd-channels/:id', authMiddleware, requirePermission('org.ussd.manage'), async (req, res) => {
  const { id } = req.params;
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const row = await prisma.ussdChannel.findFirst({ where: { id, tenantId } });
  if (!row) return res.status(404).json({ error: 'not found' });
  await prisma.ussdChannel.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
