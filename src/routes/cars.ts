
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import imagePipeline from '../services/image.pipeline';
import multer from 'multer';
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';
import { processPriceDrop } from '../services/watchlist.service';

const router = Router();
const prisma = new PrismaClient();

// Zod schemas
const createCarSchema = z.object({
  stockNo: z.string(),
  vin: z.string().optional(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  priceLocalZmw: z.number().optional(),
  priceUsd: z.number().optional(),
  publishToPublic: z.boolean().optional(),
  publishToExport: z.boolean().optional(),
});

const updateCarSchema = createCarSchema.partial();

// List cars (GET /api/cars)
router.get('/', authMiddleware, requirePermission('cars.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).user?.tenantId;
  const cars = await prisma.car.findMany({ where: { tenantId } });
  res.json(cars);
});

// Get car by ID
router.get('/:id', authMiddleware, requirePermission('cars.read'), async (req: Request, res: Response) => {
  const tenantId = (req as any).user?.tenantId;
  const car = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

// Create car
router.post('/', authMiddleware, requirePermission('cars.create'), async (req: Request, res: Response) => {
  const tenantId = (req as any).user?.tenantId;
  try {
    const parsed = createCarSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    const car = await prisma.car.create({ data: { ...req.body, tenantId } });
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create car', details: err });
  }
});

// Update car
router.patch('/:id', authMiddleware, requirePermission('cars.update'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  try {
    const parsed = updateCarSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    const existing = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Car not found or access denied' });
    // Capture previous prices before update
    const oldUsd = existing.priceUsd ? Number(existing.priceUsd) : null;
    const oldLocal = existing.priceLocalZmw ? Number(existing.priceLocalZmw) : null;
    const car = await prisma.car.update({ where: { id: req.params.id }, data: req.body });
    const newUsd = car.priceUsd ? Number(car.priceUsd) : null;
    const newLocal = car.priceLocalZmw ? Number(car.priceLocalZmw) : null;
    // Check for price decrease
    let shouldNotify = false;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = (tenant?.settings as any) || {};
    const thresholdPct = settings.priceDropThresholdPct || 1;
    const thresholdAmt = settings.priceDropThresholdAmountUsd || 50;
    if (oldUsd != null && newUsd != null && newUsd < oldUsd) {
      const pct = ((oldUsd - newUsd) / oldUsd) * 100;
      const abs = oldUsd - newUsd;
      if (pct >= thresholdPct || abs >= thresholdAmt) shouldNotify = true;
    }
    if (oldLocal != null && newLocal != null && newLocal < oldLocal) {
      const pct = ((oldLocal - newLocal) / oldLocal) * 100;
      const abs = oldLocal - newLocal;
      if (pct >= thresholdPct || abs >= thresholdAmt) shouldNotify = true;
    }
    // Only notify if car is published to public or export
    if (shouldNotify && (car.publishToExport || car.publishToPublic)) {
      await processPriceDrop(tenantId, car, oldUsd, oldLocal, (req as any).user?.id);
    }
    // FX margin guard
    try {
      const fx = await prisma.fxSetting.findUnique({ where: { tenantId } });
      if (fx && car.priceUsd && car.priceLocalZmw) {
        const localEquivalent = Number(car.priceUsd) * Number(fx.usdToLocal);
        const marginPct = ((Number(car.priceLocalZmw) - localEquivalent) / (localEquivalent || 1)) * 100;
        if (marginPct < Number(fx.minMarginPct)) {
          // write an audit warning and include header in response
          await prisma.auditLog.create({ data: { tenantId, actorType: 'system', actorId: 'system', action: 'price.margin_warning', entity: 'car', entityId: car.id, beforeJson: JSON.stringify({ oldLocal, oldUsd }), afterJson: JSON.stringify({ newLocal, newUsd }) } as any });
          (res as any).setHeader('X-Price-Margin-Warning', 'true');
        }
      }
    } catch (err) { /* ignore */ }
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update car', details: err });
  }
});

// Delete car
router.delete('/:id', authMiddleware, requirePermission('cars.delete'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  try {
    const existing = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Car not found or access denied' });
    await prisma.car.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete car', details: err });
  }
});

// Upload media (url only for now) -> POST /api/cars/:id/media
router.post('/:id/media', authMiddleware, requirePermission('cars.media.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { url, type, sortNo } = req.body;
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Car not found or access denied' });
  const media = await prisma.carMedia.create({ data: { tenantId, carId: req.params.id, url, type, sortNo: sortNo || 0 } });
  res.status(201).json(media);
});

// Ingest image (file base64 or URL) -> POST /api/cars/:id/media/ingest
router.post('/:id/media/ingest', authMiddleware, requirePermission('cars.media.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { url, base64, type, sortNo } = req.body;
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Car not found or access denied' });
  let buffer: Buffer | null = null;
  try {
    if (base64) {
      const match = base64.match(/^data:([a-zA-Z0-9+/]+);base64,(.*)$/);
      const b64 = match ? match[2] : base64;
      buffer = Buffer.from(b64, 'base64');
    } else if (url) {
      const resp = await fetch(url);
      if (!resp.ok) return res.status(400).json({ error: 'Unable to fetch URL for ingest' });
      const arr = new Uint8Array(await resp.arrayBuffer());
      buffer = Buffer.from(arr);
    } else {
      return res.status(400).json({ error: 'Provide either url or base64 image data' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Failed to fetch or decode image', details: err });
  }
  const result = await imagePipeline.ingestFromBuffer(buffer, ((req as any).tenantSlug as string) || 'public');
  const media = await prisma.carMedia.create({ data: { tenantId, carId: req.params.id, url: result.urls.detail || url || '', type: type || 'image', sortNo: sortNo || 0, metaJson: JSON.stringify({ qualityScore: result.qualityScore, rejected: result.rejected, reason: result.reason }) } });
  res.status(201).json({ media, ingest: result });
});

// Upload binary file -> POST /api/cars/:id/media/upload
router.post('/:id/media/upload', authMiddleware, requirePermission('cars.media.manage'), upload.single('file'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { type, sortNo } = req.body;
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Car not found or access denied' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const result = await imagePipeline.ingestFromBuffer(req.file.buffer, ((req as any).tenantSlug as string) || 'public');
  const media = await prisma.carMedia.create({ data: { tenantId, carId: req.params.id, url: result.urls.detail || '', type: type || 'image', sortNo: Number(sortNo) || 0, metaJson: JSON.stringify({ qualityScore: result.qualityScore, rejected: result.rejected, reason: result.reason }) } });
  res.status(201).json({ media, ingest: result });
});

// Update media -> PATCH /api/cars/:id/media/:mediaId
router.patch('/:id/media/:mediaId', authMiddleware, requirePermission('cars.media.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const mediaExists = await prisma.carMedia.findFirst({ where: { id: req.params.mediaId, tenantId } });
  if (!mediaExists) return res.status(404).json({ error: 'Media not found or access denied' });
  const media = await prisma.carMedia.update({ where: { id: req.params.mediaId }, data: req.body });
  res.json(media);
});

export default router;
