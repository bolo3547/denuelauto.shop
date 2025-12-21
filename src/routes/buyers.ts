import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import paymentService from '../services/payment.service';
import warrantyService from '../services/warranty.service';
import loyaltyService from '../services/loyalty.service';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authMiddleware, requirePermission('buyers.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const buyers = await prisma.buyer.findMany({ where: { tenantId } });
  res.json(buyers);
});

const createBuyerSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  addressJson: z.any().optional(),
});

router.post('/', authMiddleware, requirePermission('buyers.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const parsed = createBuyerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  const buyer = await prisma.buyer.create({ data: { ...parsed.data, tenantId } });
  res.status(201).json(buyer);
});

router.patch('/:id', authMiddleware, requirePermission('buyers.manage'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const existing = await prisma.buyer.findFirst({ where: { id: req.params.id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Buyer not found or access denied' });
  const buyer = await prisma.buyer.update({ where: { id: req.params.id }, data: req.body });
  res.json(buyer);
});

// Delete a watchlist entry: DELETE /api/buyers/watchlist/:id  (buyer-auth optional)
router.delete('/watchlist/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const authHeader = (req.headers.authorization as string | undefined);
  let userId: string | undefined;
  let role: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload: any = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'changeme');
      userId = payload.id; role = payload.role;
    } catch (err) {
      // ignore
    }
  }
  const w = await prisma.watchlist.findUnique({ where: { id } });
  if (!w) return res.status(404).json({ error: 'Not found' });
  // If authenticated buyer, allow deletion if user's id is buyerId OR management permission
  if (userId) {
    if ((w as any).userId === userId || role === 'dealer_owner' || role === 'dealer_manager') {
      await prisma.watchlist.delete({ where: { id } });
      return res.json({ success: true });
    }
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Not authenticated: allow deletion if email or phone sent and matches
  const { email, phone } = req.body as { email?: string; phone?: string };
  if (email && w.email === email) { await prisma.watchlist.delete({ where: { id } }); return res.json({ success: true }); }
  if (phone && w.phone === phone) { await prisma.watchlist.delete({ where: { id } }); return res.json({ success: true }); }
  return res.status(400).json({ error: 'Provide matching email or phone to delete' });
});

// GET /buyer/loyalty -> { points, history }
router.get('/loyalty', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const acc = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: userId } });
  const events = await prisma.loyaltyEvent.findMany({ where: { tenantId, buyerId: userId }, orderBy: { createdAt: 'desc' } });
  res.json({ points: acc?.points || 0, history: events });
});

// GET buyer checkout summary: flags + proforma summary + warranty options + loyalty points
router.get('/proformas/:id/checkout', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId }, include: { proforma: false } } as any);
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  // parse tenant settings for payment flags
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const settings = (tenant?.settings as any) || {};
  const payments = settings.payments || {};
  const warrantyFlag = settings.warranty?.exporter_enabled || false;
  const loyaltySettings = settings.loyalty || { points_per_usd: 1, min_redeem_points: 50 };
  const warranty = await prisma.warrantySelection.findFirst({ where: { proformaId: pf.id, tenantId } });
  const account = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: pf.userId || userId } });
  res.json({ proforma: pf, flags: { cardEnabled: !!payments.card_enabled, paypalEnabled: !!payments.paypal_enabled }, warranty, loyalty: { points: account?.points || 0, settings: loyaltySettings } });
});

// POST /buyer/proformas/:id/warranty -> { selected: boolean }
router.post('/proformas/:id/warranty', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const selected = !!req.body.selected;
  const w = await warrantyService.upsertWarranty(tenantId, pf.id, selected);
  const updatedPf = await prisma.proformaInvoice.findUnique({ where: { id: pf.id } });
  res.json({ success: true, warranty: w, proforma: updatedPf });
});

// POST /buyer/proformas/:id/pay/card
router.post('/proformas/:id/pay/card', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const cardEnabled = (tenant?.settings as any)?.payments?.card_enabled;
  if (!cardEnabled) return res.status(403).json({ error: 'Card payments are not enabled for this tenant' });
  const intent = await paymentService.createCardIntent(tenantId, pf.id, pf.userId || userId, Number(pf.total || 0), pf.currency || 'USD');
  res.json({ clientSecret: intent.clientSecret, intentId: intent.pi.id });
});

// POST /buyer/proformas/:id/pay/paypal
router.post('/proformas/:id/pay/paypal', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const paypalEnabled = (tenant?.settings as any)?.payments?.paypal_enabled;
  if (!paypalEnabled) return res.status(403).json({ error: 'PayPal payments are not enabled for this tenant' });
  const intent = await paymentService.createPaypalIntent(tenantId, pf.id, pf.userId || userId, Number(pf.total || 0), pf.currency || 'USD');
  res.json({ approvalUrl: intent.approvalUrl, intentId: intent.pi.id });
});

// POST /buyer/proformas/:id/redeem -> { points }
router.post('/proformas/:id/redeem', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const points = Number(req.body.points || 0);
  if (!userId) return res.status(401).json({ error: 'Must be authenticated' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const loyaltySettings = (tenant?.settings as any)?.loyalty || { points_per_usd: 1, min_redeem_points: 50 };
  const acc = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: userId } });
  if (!acc || acc.points < points) return res.status(400).json({ error: 'Not enough points' });
  if (points < (loyaltySettings.min_redeem_points || 50)) return res.status(400).json({ error: `Minimum redeem points is ${loyaltySettings.min_redeem_points}` });
  // calculate credit USD (e.g., 1 point = 0.01 USD) — safer to define: 100 points = $1 (adjustable). We'll assume 100 points = $1.
  const creditUsd = (points / 100);
  // add a discount line to proforma
  const items = (pf as any).lineItemsJson?.items || [];
  items.push({ name: 'Loyalty Points Redeem', amount: -Number(creditUsd.toFixed(2)) });
  let total = 0;
  for (const it of items) { if (it.amount) total += Number(it.amount); }
  await prisma.proformaInvoice.update({ where: { id: pf.id }, data: { lineItemsJson: { items }, total } });
  // create redeem event
  await loyaltyService.redeemPoints(tenantId, userId, points);
  res.json({ success: true, newTotal: total });
});

// GET /buyer/loyalty -> { points, history }
router.get('/loyalty', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Must be authenticated' });
  const acc = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: userId } });
  const events = await prisma.loyaltyEvent.findMany({ where: { tenantId, buyerId: userId }, orderBy: { createdAt: 'desc' } });
  res.json({ points: acc?.points || 0, history: events });
});

// POST /buyer/favorites/:carId - add a favorite
router.post('/favorites/:carId', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const { carId } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  // ensure car belongs to tenant
  const car = await prisma.car.findFirst({ where: { id: carId, tenantId } });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  const fav = await prisma.favorite.create({ data: { tenantId, buyerId: userId, carId } });
  res.status(201).json(fav);
});

// GET /buyer/favorites - list favorites for the authenticated buyer
router.get('/favorites', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const favs = await prisma.favorite.findMany({ where: { tenantId, buyerId: userId }, include: { car: true } });
  res.json(favs.map(f => ({ id: f.id, car: f.car }))); // return car objects for UI
});

// GET /buyer/watchlist - list watchlist entries (for authenticated buyer)
router.get('/watchlist', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const wl = await prisma.watchlist.findMany({ where: { tenantId, buyerId: userId }, include: { car: true } });
  res.json(wl);
});

// DELETE /buyer/favorites/:carId - remove a favorite
router.delete('/favorites/:carId', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const { carId } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const fav = await prisma.favorite.findFirst({ where: { tenantId, buyerId: userId, carId } });
  if (!fav) return res.status(404).json({ error: 'Not found' });
  await prisma.favorite.delete({ where: { id: fav.id } });
  res.json({ success: true });
});

// Expose endpoints for Buyer 'Garage' backed by new GarageEntry model
router.get('/garage', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const entries = await prisma.garageEntry.findMany({ where: { tenantId, buyerId: userId }, include: { car: true } });
  res.json(entries.map(e => ({ id: e.id, note: e.note, createdAt: e.createdAt, car: e.car, userCarJson: (e as any).userCarJson }))); 
});

router.post('/garage', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { carId, note, userCarJson } = req.body as { carId?: string; note?: string; userCarJson?: any };
  if (!carId && !userCarJson) return res.status(400).json({ error: 'carId or userCarJson required' });
  if (carId) {
    const car = await prisma.car.findFirst({ where: { id: carId, tenantId } });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    const existing = await prisma.garageEntry.findFirst({ where: { tenantId, buyerId: userId, carId } });
    if (existing) return res.status(200).json(existing);
    const created = await prisma.garageEntry.create({ data: { tenantId, buyerId: userId, carId, note } as any });
    res.status(201).json(created);
    return;
  }
  // store arbitrary user car data in JSON when no carId supplied
  const created = await prisma.garageEntry.create({ data: { tenantId, buyerId: userId, userCarJson: userCarJson, note } as any });
  res.status(201).json(created);
});

router.delete('/garage/:id', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const existing = await prisma.garageEntry.findFirst({ where: { id, tenantId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.buyerId !== userId) return res.status(403).json({ error: 'Forbidden' });
  await prisma.garageEntry.delete({ where: { id } });
  res.json({ success: true });
});

export default router;

