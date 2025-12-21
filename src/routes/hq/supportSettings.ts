import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireHqAdminAuth, requireHqRole } from '../../middleware/hqAuth';

const prisma = new PrismaClient();
const router = Router();

// HQ-only endpoints
router.get('/support-settings', requireHqAdminAuth, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.supportSettings.findFirst();
    return res.json(settings || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch support settings' });
  }
});

router.put('/support-settings', requireHqAdminAuth, requireHqRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { ownerName, supportEmail, primaryPhone, secondaryPhone } = req.body;
    if (!supportEmail || !primaryPhone) return res.status(400).json({ error: 'supportEmail and primaryPhone are required' });
    const existing = await prisma.supportSettings.findFirst();
    if (!existing) {
      const created = await prisma.supportSettings.create({ data: { ownerName, supportEmail, primaryPhone, secondaryPhone } });
      return res.json(created);
    }
    const updated = await prisma.supportSettings.update({ where: { id: existing.id }, data: { ownerName, supportEmail, primaryPhone, secondaryPhone } });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update support settings' });
  }
});

// Public endpoints (read-only)
const publicRouter = Router();

publicRouter.get('/support-info', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.supportSettings.findFirst();
    if (!settings) return res.json(null);
    return res.json({ ownerName: settings.ownerName, supportEmail: settings.supportEmail, primaryPhone: settings.primaryPhone, secondaryPhone: settings.secondaryPhone });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch public support info' });
  }
});

publicRouter.get('/payment-instructions', async (req: Request, res: Response) => {
  try {
    // get billing settings and default wallet
    const billing = await prisma.billingSettings.findFirst();
    let wallet = null;
    if (billing && billing.defaultWalletId) {
      wallet = await prisma.payoutMobileWallet.findUnique({ where: { id: billing.defaultWalletId } });
    }
    // if no billing/default wallet, pick any default wallet
    if (!wallet) {
      wallet = await prisma.payoutMobileWallet.findFirst({ where: { isDefault: true } });
    }

    const support = await prisma.supportSettings.findFirst();

    return res.json({ wallet: wallet || null, support: support || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch payment instructions' });
  }
});

export { router as hqSupportRouter, publicRouter as hqSupportPublicRouter };

export default router;
