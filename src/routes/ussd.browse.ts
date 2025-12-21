import express from 'express';
import { PrismaClient } from '@prisma/client';
import ussdService from '../services/ussd.service';
const router = express.Router();
const prisma = new PrismaClient();

router.post('/ussd/browse', async (req, res) => {
  const { tenantId, category, page } = req.body;
  if (!tenantId) return res.status(400).json({ error: 'tenantId required' });
  const lines: string[] = [];
  // For simplicity, will list by publishToPublic and optionally category (by make)
  const where: any = { tenantId, publishToPublic: true };
  if (category) where.make = category;
  const cars = await prisma.car.findMany({ where, take: 6, orderBy: { updatedAt: 'desc' } });
  cars.forEach((c, i) => lines.push(`${i+1}) ${c.shortCode} ${c.make} ${c.model} ${c.year} ZMW${c.priceLocalZmw}`));
  res.json({ ok: true, lines });
});

export default router;
