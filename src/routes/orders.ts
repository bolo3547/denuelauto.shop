import express from 'express';
import { PrismaClient } from '@prisma/client';
import orderService from '../services/order.service';
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/orders/from-ussd
router.post('/from-ussd', async (req, res) => {
  const { tenantId, msisdn, stockNo, payment_request_id } = req.body;
  if (!tenantId || !msisdn || !stockNo || !payment_request_id) return res.status(400).json({ error: 'missing fields' });
  // find mobile payment
  const mp = await prisma.mobilePayment.findFirst({ where: { tenantId, requestId: payment_request_id } });
  if (!mp) return res.status(404).json({ error: 'payment not found' });
  if (mp.status !== 'approved') return res.status(409).json({ error: 'payment not approved' });
  const cart = await prisma.ussdCart.findFirst({ where: { tenantId, msisdn, stockNo, status: 'held' } });
  if (!cart) return res.status(404).json({ error: 'cart not found' });
  const out = await orderService.createOrderFromCart(tenantId, cart, mp as any);
  res.json({ ok: true, orderRef: out.order.ref, proformaId: out.proforma.id });
});

// GET /api/orders/:ref
router.get('/:ref', async (req, res) => {
  const { ref } = req.params;
  const order = await prisma.order.findUnique({ where: { ref } });
  if (!order) return res.status(404).json({ error: 'order not found' });
  res.json({ ok: true, order });
});

router.get('/:ref/status', async (req, res) => {
  const { ref } = req.params;
  const order = await prisma.order.findUnique({ where: { ref } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json({ ref: order.ref, status: order.status, proformaId: order.proformaId });
});

export default router;
