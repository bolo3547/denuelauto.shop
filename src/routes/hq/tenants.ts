import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireHqAdminAuth, requireHqRole } from '../../middleware/hqAuth';
import { provisionTenant } from '../../services/hqProvision.service';

const router = express.Router();
const prisma = new PrismaClient();

// Get tenants (list) — accessible to SUPER_ADMIN, SUPPORT, FINANCE for read
router.get('/', requireHqAdminAuth, requireHqRole(['SUPER_ADMIN', 'SUPPORT', 'FINANCE']), async (req: Request, res: Response) => {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ tenants });
});

// Get tenant detail — read-only
router.get('/:slug', requireHqAdminAuth, requireHqRole(['SUPER_ADMIN', 'SUPPORT', 'FINANCE']), async (req: Request, res: Response) => {
  const { slug } = req.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ tenant });
});

// POST /api/hq/tenants/provision - create a new tenant (HQ-created)
router.post('/provision', requireHqAdminAuth, requireHqRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await provisionTenant(payload);
    res.status(201).json({ ok: true, tenant: { id: result.tenant.id, slug: result.tenant.slug, name: result.tenant.name }, user: { id: result.adminUser.id, email: result.adminUser.email } });
  } catch (err) {
    console.error('HQ tenant provision failed', err);
    res.status(500).json({ error: 'Provision failed' });
  }
});

export default router;
