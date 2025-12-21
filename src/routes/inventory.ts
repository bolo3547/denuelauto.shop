import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type') as any, false as any);
  cb(null, true);
} });
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// Middleware to validate tenant ID
router.use((req, res, next) => {
  const tid = req.headers['x-tenant-id'];
  const tenantId = Array.isArray(tid) ? tid[0] : tid;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required.' });
  }
  (req as any).tenantId = tenantId as string;
  next();
});

// Get inventory with filters, pagination, and sorting
router.get('/admin/cars', async (req, res) => {
  const search = req.query.search as string | undefined;
  const filters = req.query.filters as string | undefined;
  const page = Number(req.query.page || 1);
  const sort = String(req.query.sort || 'updatedAt');
  const pageSize = 10;

  try {
    const where = {
      tenantId: req.tenantId,
      ...(search && { OR: [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ] }),
      ...(filters && JSON.parse(filters || '{}')),
    };

    const cars = await prisma.car.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sort as any]: 'desc' },
    });

    const total = await prisma.car.count({ where });

    res.json({ cars, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Add a new car to inventory
router.post('/admin/cars', async (req, res) => {
  const { make, model, year, priceUsd, priceLocalZmw, branchId, stockNo } = req.body;

  try {
    const car = await prisma.car.create({
      data: {
        tenantId: (req as any).tenantId as string,
        stockNo: stockNo || `AUTO-${Date.now()}`,
        status: 'draft',
        make,
        model,
        year,
        priceUsd,
        priceLocalZmw,
        locationBranchId: branchId,
      },
    });

    res.status(201).json(car);
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update car details
router.patch('/admin/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { make, model, year, priceUsd, priceLocalZmw, branchId } = req.body;

  try {
    const car = await prisma.car.update({
      where: { id },
      data: {
        make,
        model,
        year,
        priceUsd,
        priceLocalZmw,
        locationBranchId: branchId,
      },
    });

    res.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Publish/unpublish car
router.post('/admin/cars/:id/publish', async (req, res) => {
  const { id } = req.params;
  const { publishToPublic, publishToExport } = req.body;

  try {
    const car = await prisma.car.update({
      where: { id },
      data: {
        publishToPublic,
        publishToExport,
      },
    });

    res.json(car);
  } catch (error) {
    console.error('Error publishing car:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Import cars via CSV
router.post('/admin/cars/import-csv', async (req, res) => {
  // Placeholder for CSV import logic
  res.status(501).json({ error: 'Not implemented.' });
});

// Upload media for a car
router.post('/admin/cars/:id/media', upload.single('file'), async (req, res) => {
  const carId = req.params.id;
  const tenantId = req.tenantId;
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'file required' });
  // For now, store locally; optionally upload to S3
  const dest = path.join(process.cwd(), 'public', 'uploads', file.filename + path.extname(file.originalname));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.rename(file.path, dest);
  const url = `/uploads/${path.basename(dest)}`;
  const qualityScore = Math.floor(Math.random() * 100); // placeholder
  const cm = await prisma.carMedia.create({ data: { tenantId, carId, url, type: 'image', sortNo: 0, watermarkApplied: false, metaJson: { qualityScore } } as any });
  res.status(201).json(cm);
});

// Patch media meta or delete
router.patch('/admin/cars/:id/media/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { delete: doDelete, sortNo, watermark } = req.body;
  const existing = await prisma.carMedia.findUnique({ where: { id: mediaId } });
  if (!existing) return res.status(404).json({ error: 'Media not found' });
  if (doDelete) {
    await prisma.carMedia.delete({ where: { id: mediaId } });
    return res.json({ ok: true });
  }
  const updated = await prisma.carMedia.update({ where: { id: mediaId }, data: { sortNo: sortNo ?? existing.sortNo, watermarkApplied: watermark ?? existing.watermarkApplied } as any });
  res.json(updated);
});

// Ingest media (EXIF strip, quality scoring, WebP derivs, watermarking)
router.post('/admin/cars/:id/media/ingest', async (req, res) => {
  const { id } = req.params;
  // Placeholder: iterate media and assign qualityScore & webp url
  const media = await prisma.carMedia.findMany({ where: { carId: id } });
  for (const m of media) {
    // Mock ingest process
    const updated = await prisma.carMedia.update({ where: { id: m.id }, data: { metaJson: { ...(m.metaJson as any || {}), qualityScore: Math.floor(Math.random() * 100) }, watermarkApplied: true } as any });
    // Generate webp derivs / CDN URL omitted for brevity
  }
  res.json({ ok: true });
});

export default router;