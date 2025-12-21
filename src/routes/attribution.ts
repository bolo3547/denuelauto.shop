import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { tenantResolver } from '../middleware/tenant';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });
const attribLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// GET /t/:slug/public/attribution/agent?code=REF
router.get('/attribution/agent', attribLimiter, tenantResolver, async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  const affiliate = await prisma.affiliate.findFirst({ where: { tenantId, referralCode: code } });
  if (!affiliate) return res.status(404).json({ error: 'Unknown code' });
  // set cookie for 30 days
  res.cookie('agent_ref', code, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false });
  await prisma.affiliateClick.create({ data: { tenantId, affiliateId: affiliate.id, ip: req.ip, ua: req.headers['user-agent'] || '' } as any });
  // 204 no content
  return res.status(204).send();
});

export default router;