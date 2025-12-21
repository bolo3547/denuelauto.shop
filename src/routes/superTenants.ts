import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import billingService from '../services/billing.service';

const prisma = new PrismaClient();
const router = Router();

// POST /super/tenants/create
router.post('/tenants/create', async (req: Request, res: Response) => {
  const { name, slug, ownerEmail } = req.body;
  if (!name || !slug || !ownerEmail) return res.status(400).json({ error: 'Invalid params' });
  // create tenant
  const t = await prisma.tenant.create({ data: { name, slug } as any });
  // create admin user
  const user = await prisma.user.create({ data: { tenantId: t.id, email: ownerEmail, role: 'dealer_owner', passwordHash: '' } as any });
  // create default billing account and free trial
  await billingService.createCustomer(t.id, 'stripe', { trial: true });
  // create entitlements default
  await prisma.entitlements.create({ data: { tenantId: t.id, modulesJson: { modules: ['marketplace'] } as any } as any });
  // return tenant
  return res.status(201).json({ tenant: t, owner: user });
});

// POST /super/tenants/provision -> run provisioning tasks (storage, seed, bucket)
router.post('/tenants/:id/provision', async (req: Request, res: Response) => {
  const tenantId = req.params.id;
  // For prototype: create default settings & seed sample data
  await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { defaultBranch: 'main' } as any } as any });
  // create S3 prefix and default roles (just a seed user if not exists)
  return res.json({ ok: true });
});

// POST /super/tenants/:id/features -> set features in tenant.settings.featureFlags
router.post('/tenants/:id/features', async (req: Request, res: Response) => {
  const tenantId = req.params.id;
  const features = req.body?.featureFlags || {};
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const currentSettings = (existing?.settings && typeof existing.settings === 'object') ? existing.settings : {};
  const t = await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { ...currentSettings, featureFlags: features } as any } as any });
  res.json({ tenant: t, featureFlags: features });
});

// POST /super/tenants/:id/redact - create a job to redact PII
router.post('/tenants/:id/redact', async (req: Request, res: Response) => {
  const tenantId = req.params.id;
  // In production this should add a job to queue; for now mark tenant settings redactRequested
  await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { redactionRequestedAt: new Date() } as any } as any });
  return res.json({ ok: true });
});

// POST /super/tenants/:id/teardown - soft delete
router.post('/tenants/:id/teardown', async (req: Request, res: Response) => {
  const tenantId = req.params.id;
  await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { deletedAt: new Date() } as any } as any });
  // enqueue job to purge (left as TODO)
  return res.json({ ok: true });
});

export default router;
