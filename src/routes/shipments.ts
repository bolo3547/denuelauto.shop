import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { writeRateLimiter } from '../middleware/rateLimit';
import { requireStepUp } from '../middleware/stepUp';
import { recordAudit } from '../services/audit.service';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', authMiddleware, requirePermission('shipments.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const shipments = await prisma.shipment.findMany({ where: { tenantId } });
  res.json(shipments);
});

const createShipmentSchema = z.object({
  carId: z.string(),
  buyerId: z.string(),
  portId: z.string(),
  shipMethod: z.string(),
  etd: z.string().optional(),
  eta: z.string().optional(),
});

router.post('/', writeRateLimiter, authMiddleware, requirePermission('shipments.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createShipmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  // verify car, buyer, and port ownership
  const car = await prisma.car.findFirst({ where: { id: parsed.data.carId, tenantId } });
  if (!car) return res.status(404).json({ error: 'Car not found or not in tenant' });
  const buyer = await prisma.buyer.findFirst({ where: { id: parsed.data.buyerId, tenantId } });
  if (!buyer) return res.status(404).json({ error: 'Buyer not found or not in tenant' });
  const port = await prisma.exportPort.findFirst({ where: { id: parsed.data.portId, tenantId } });
  if (!port) return res.status(404).json({ error: 'Port not found or not in tenant' });
  const sh = await prisma.shipment.create({ data: { ...parsed.data, tenantId, status: 'pending' } as any });
  res.status(201).json(sh);
});

router.patch('/:id', authMiddleware, requirePermission('shipments.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.shipment.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Shipment not found or access denied' });
  const sh = await prisma.shipment.update({ where: { id: req.params.id }, data: req.body });
  res.json(sh);
});

router.post('/:id/timeline', authMiddleware, requirePermission('shipments.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { statusKey, happenedAt, note } = req.body;
  const timeline = await prisma.shippingTimeline.create({ data: { tenantId, shipmentId: req.params.id, statusKey, happenedAt: happenedAt ? new Date(happenedAt) : new Date(), note } });
  await recordAudit({ tenantId, actorId: (req as any).user?.id, action: 'shipment.timeline.create', after: timeline, meta: { shipmentId: req.params.id } });
  res.status(201).json(timeline);
});

router.get('/buyer/:id/timeline', async (req: Request, res: Response) => {
  const timeline = await prisma.shippingTimeline.findMany({ where: { shipmentId: req.params.id }, orderBy: { happenedAt: 'asc' } });
  res.json({ timeline });
});

router.post('/:id/docs', writeRateLimiter, authMiddleware, requirePermission('shipments.manage'), requireStepUp, upload.single('file'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const before = await prisma.shipment.findFirst({ where: { id: req.params.id, tenantId } });
  if (!before) return res.status(404).json({ error: 'Shipment not found' });
  const file = (req as any).file;
  const prevDocs = typeof before?.docsJson === 'object' && before?.docsJson !== null ? before.docsJson : {};
  const docs = { ...((prevDocs as any) || {}), [file?.originalname || 'file']: `/uploads/${file?.filename}` } as any;
  const shipment = await prisma.shipment.update({ where: { id: req.params.id }, data: { docsJson: docs } });
  await recordAudit({ tenantId, actorId: (req as any).user?.id, action: 'shipment.docs.upload', before, after: shipment, meta: { file: file?.originalname } });
  res.json(shipment);
});

export default router;
