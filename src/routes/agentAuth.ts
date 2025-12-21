import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const loginSchema = z.object({ email: z.string().email() });

// POST /agent/auth/login (tenant-aware via tenantResolver on mount)
router.post('/auth/login', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || req.body.tenantId;
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const agent = await prisma.agent.findFirst({ where: { tenantId, email: parsed.data.email } });
  if (!agent || !agent.portalAccess || agent.status !== 'active') return res.status(403).json({ error: 'Unauthorized' });
  const token = jwt.sign({ id: agent.id, role: 'agent', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

export default router;