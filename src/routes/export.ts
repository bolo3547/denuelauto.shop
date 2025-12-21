import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';
import entCheck from '../middleware/entitlements';

const prisma = new PrismaClient();
const router = Router();

router.get('/export/ports', authMiddleware, requirePermission('export.ports.manage'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const ports = await prisma.exportPort.findMany({ where: { tenantId } });
  res.json(ports);
});

const createPortSchema = z.object({
  name: z.string(),
  country: z.string(),
});

router.post('/export/ports', authMiddleware, requirePermission('export.ports.manage'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createPortSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const port = await prisma.exportPort.create({ data: { ...parsed.data, tenantId } });
  res.status(201).json(port);
});

router.get('/export/rules', authMiddleware, requirePermission('export.rules.manage'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const rules = await prisma.exportPriceRule.findMany({ where: { tenantId } });
  res.json(rules);
});

const createRuleSchema = z.object({
  portId: z.string(),
  baseUsd: z.number().optional(),
  freightUsd: z.number().optional(),
  insuranceRatePct: z.number().optional(),
  otherJson: z.any().optional(),
});

router.post('/export/rules', authMiddleware, requirePermission('export.rules.manage'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createRuleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const rule = await prisma.exportPriceRule.create({ data: { ...parsed.data, tenantId } });
  res.status(201).json(rule);
});

router.post('/export/calc-cif', authMiddleware, requirePermission('export.calc'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const { portId, fobUsd, otherUsd } = req.body;
  const rule = await prisma.exportPriceRule.findUnique({ where: { id: portId } });
  if (!rule) return res.status(400).json({ error: 'Rule not found' });
  const freight = rule.freightUsd || 0;
  const insurance = Number(rule.insuranceRatePct || 0) * (Number(fobUsd) / 100);
  const cif = (fobUsd || 0) + freight + insurance + (otherUsd || 0);
  res.json({ cif, fob: fobUsd, freight, insurance, other: otherUsd });
});

// Estimate packing and freight for container: POST /export/container/estimate
router.post('/export/container/estimate', authMiddleware, requirePermission('export.container.estimate'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { carIds, containerType } = req.body as { carIds: string[]; containerType: string };
  if (!Array.isArray(carIds) || !containerType) return res.status(400).json({ error: 'carIds and containerType are required' });
  const rule = await prisma.containerRule.findFirst({ where: { tenantId, type: containerType } });
  if (!rule) return res.status(404).json({ error: 'Container rule not found' });
  const dims = await prisma.carDimension.findMany({ where: { tenantId, carId: { in: carIds } } });
  // Greedy pack by cbm descending until capacity or maxUnits
  const sorted = dims.sort((a, b) => Number(b.cbm) - Number(a.cbm));
  let used = 0;
  const packed: any[] = [];
  for (const d of sorted) {
    if (packed.length >= rule.maxUnits) break;
    if (used + Number(d.cbm) > Number(rule.maxCbm)) continue;
    packed.push(d);
    used += Number(d.cbm);
  }
  const estFreight = Number(rule.baseFreightUsd) + packed.length * 50; // per-unit surcharge = $50
  res.json({ packed: packed.map((p) => p.carId), packedCount: packed.length, usedCbm: used, estFreightUsd: estFreight });
});

// Request container quote: POST /export/container/quote
router.post('/export/container/quote', authMiddleware, requirePermission('export.container.request'), entCheck.requireEntitlement('auto_export'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { carIds, containerType, contact } = req.body as { carIds: string[]; containerType: string; contact: { name: string; email: string; phone: string; country: string } };
  if (!Array.isArray(carIds) || !containerType || !contact) return res.status(400).json({ error: 'carIds, containerType and contact required' });
  // estimate
  const estimateRes = await prisma.containerRule.findFirst({ where: { tenantId, type: containerType } });
  if (!estimateRes) return res.status(404).json({ error: 'Container type not found' });
  // For simplicity, reuse estimate logic
  const dims = await prisma.carDimension.findMany({ where: { tenantId, carId: { in: carIds } } });
  const sorted = dims.sort((a, b) => Number(b.cbm) - Number(a.cbm));
  let used = 0; const packed = [] as any[];
  for (const d of sorted) {
    if (packed.length >= estimateRes.maxUnits) break;
    if (used + Number(d.cbm) > Number(estimateRes.maxCbm)) continue;
    packed.push(d); used += Number(d.cbm);
  }
  const estFreight = Number(estimateRes.baseFreightUsd) + packed.length * 50;
  const created = await prisma.containerQuote.create({ data: { tenantId, itemsJson: { items: carIds }, containerType, estFreightUsd: estFreight, status: 'requested' } as any });
  // Create lead to admin
  await prisma.lead.create({ data: { tenantId, carId: packed[0]?.carId || carIds[0], source: 'container', name: contact.name, email: contact.email, phone: contact.phone, message: `Container quote for ${carIds.length} cars` } });
  res.status(201).json({ reference: created.id, estFreightUsd: estFreight, packedCount: packed.length });
});

export default router;