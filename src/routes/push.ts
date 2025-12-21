import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();
const router = Router();

const subscribeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

// Save push subscription
router.post('/subscribe', authMiddleware, subscribeLimiter, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const { endpoint, p256dh, auth, topics } = req.body as { endpoint: string; p256dh: string; auth: string; topics?: string[] };
  if (!endpoint || !p256dh || !auth) return res.status(400).json({ error: 'missing subscription info' });
  const created = await prisma.pushSubscription.create({ data: { tenantId, userId, endpoint, p256dh, auth, topicsJson: topics } });
  res.json(created);
});

router.post('/unsubscribe', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { endpoint } = req.body as { endpoint: string };
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
  await prisma.pushSubscription.deleteMany({ where: { tenantId, endpoint } });
  res.json({ success: true });
});

// Broadcast to topic (admin only)
router.post('/broadcast', authMiddleware, requirePermission('push.broadcast'), async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const { topic, title, body, deep_link } = req.body as { topic: string; title: string; body: string; deep_link?: string };
  if (!topic || !title || !body) return res.status(400).json({ error: 'topic/title/body required' });
  // find all subs for topic
  const subs = await prisma.pushSubscription.findMany({ where: { tenantId, topicsJson: { contains: topic } as any } });
  // For simplicity, we just record a campaign row and return count
  await prisma.campaign.create({ data: { tenantId, topic, title, body, deepLink: deep_link } as any });
  res.json({ success: true, recipients: subs.length });
});

export default router;
