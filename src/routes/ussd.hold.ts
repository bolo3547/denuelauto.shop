import express from 'express';
import { PrismaClient } from '@prisma/client';
import ussdService from '../services/ussd.service';
import { recordAudit } from '../services/audit.service';
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ussd/hold
router.post('/ussd/hold', async (req, res) => {
  const { tenantId, msisdn, stockNo } = req.body;
  if (!tenantId || !msisdn || !stockNo) return res.status(400).json({ error: 'missing fields' });
  // idempotent: check existing held cart for msisdn+stockNo
  const existing = await prisma.ussdCart.findFirst({ where: { tenantId, msisdn, stockNo, status: 'held' } });
  if (existing) return res.json({ ok: true, cart: existing, alreadyHeld: true });
  const result = await ussdService.holdCar(tenantId, msisdn, stockNo);
  if (!result.ok) return res.status(409).json({ ok: false, reason: result.reason });
  await recordAudit({ tenantId, action: 'ussd.hold.create', after: result.cart, meta: { stockNo } });
  return res.json({ ok: true, cart: result.cart, car: result.car });
});

export default router;
