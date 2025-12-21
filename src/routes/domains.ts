import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';
import domainService from '../services/domain.service';
import { recordAudit } from '../services/audit.service';

const prisma = new PrismaClient();
const router = Router();

// POST /admin/domains -> create custom domain
router.post('/admin/domains', authMiddleware, requirePermission('org.domains.manage'), requireStepUp, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { hostname } = req.body;
  if (!hostname) return res.status(400).json({ error: 'hostname required' });
  const dnsTxt = domainService.generateDnsTxt(hostname);
  const d = await prisma.customDomain.create({ data: { tenantId, hostname, dnsTxt, status: 'verifying' } as any });
  await recordAudit({ tenantId, actorId: (req as any).user?.id, action: 'domain.create', after: d });
  res.json({ domain: d, instructions: { addTxt: { name: hostname, value: dnsTxt } } });
});

// GET /admin/domains
router.get('/admin/domains', authMiddleware, requirePermission('org.domains.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const list = await prisma.customDomain.findMany({ where: { tenantId } });
  res.json(list);
});

// POST /admin/domains/:id/verify -> check DNS and request cert
router.post('/admin/domains/:id/verify', authMiddleware, requirePermission('org.domains.manage'), requireStepUp, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const d = await prisma.customDomain.findFirst({ where: { id: req.params.id, tenantId } });
  if (!d) return res.status(404).json({ error: 'domain not found' });
  // allow two ways to verify: a) DNS TXT exists, b) Manual verify token matches
  const manualToken = req.body?.verifyToken as string | undefined;
  let ok = false;
  if (manualToken && manualToken === d.dnsTxt) ok = true;
  if (!ok) ok = await domainService.verifyDomainDnsTxt(d.hostname, d.dnsTxt || '');
  if (!ok) return res.status(400).json({ error: 'DNS TXT not found or mismatch' });
  const certMeta = await domainService.requestCertForHostname(d.hostname);
  const updated = await prisma.customDomain.update({ where: { id: d.id }, data: { status: 'active', certMeta: certMeta as any } as any });
  await recordAudit({ tenantId, actorId: (req as any).user?.id, action: 'domain.verify', before: d, after: updated });
  res.json(updated);
});

// DELETE /admin/domains/:id
router.delete('/admin/domains/:id', authMiddleware, requirePermission('org.domains.manage'), requireStepUp, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const d = await prisma.customDomain.findFirst({ where: { id: req.params.id, tenantId } });
  if (!d) return res.status(404).json({ error: 'domain not found' });
  await prisma.customDomain.delete({ where: { id: d.id } });
  await recordAudit({ tenantId, actorId: (req as any).user?.id, action: 'domain.delete', before: d });
  res.json({ ok: true });
});

export default router;
