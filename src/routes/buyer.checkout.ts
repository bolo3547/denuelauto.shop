import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import paymentService from '../services/payment.service';
import warrantyService from '../services/warranty.service';
import loyaltyService from '../services/loyalty.service';

const prisma = new PrismaClient();
const router = Router();

// (Removed temporary non-auth test endpoint after verification)

// GET /buyer/proformas/:id/checkout
router.get('/proformas/:id/checkout', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const settings = (tenant?.settings as any) || {};
  const payments = settings.payments || {};
  const loyaltySettings = settings.loyalty || { points_per_usd: 1, min_redeem_points: 50 };
  const warranty = await prisma.warrantySelection.findFirst({ where: { proformaId: pf.id, tenantId } });
  const account = userId ? await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: userId } }) : null;
  res.json({ proforma: pf, flags: { cardEnabled: !!payments.card_enabled, paypalEnabled: !!payments.paypal_enabled }, warranty, loyalty: { points: account?.points || 0, settings: loyaltySettings } });
});

// POST /buyer/proformas/:id/warranty
router.post('/proformas/:id/warranty', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  const selected = !!req.body.selected;
  const w = await warrantyService.upsertWarranty(tenantId, pf.id, selected);
  res.json({ success: true, warranty: w });
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
  const intent = await paymentService.createCardIntent(tenantId, pf.id, (pf as any).buyerId || userId, Number(pf.total || 0), (pf as any).currency || 'USD');
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
  const intent = await paymentService.createPaypalIntent(tenantId, pf.id, (pf as any).buyerId || userId, Number(pf.total || 0), (pf as any).currency || 'USD');
  res.json({ approvalUrl: intent.approvalUrl, intentId: intent.pi.id });
});

// POST /buyer/proformas/:id/redeem
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
  const creditUsd = (points / 100);
  const items = (pf as any).lineItemsJson?.items || [];
  items.push({ name: 'Loyalty Points Redeem', amount: -Number(creditUsd.toFixed(2)) });
  let total = 0; for (const it of items) { if ((it as any).amount) total += Number((it as any).amount); }
  await prisma.proformaInvoice.update({ where: { id: pf.id }, data: { lineItemsJson: { items }, total } });
  await loyaltyService.redeemPoints(tenantId, userId, points);
  res.json({ success: true, newTotal: total });
});

// GET /buyer/loyalty
router.get('/loyalty', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const acc = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId: userId } });
  const events = await prisma.loyaltyEvent.findMany({ where: { tenantId, buyerId: userId }, orderBy: { createdAt: 'desc' } });
  res.json({ points: acc?.points || 0, history: events });
});

export default router;
