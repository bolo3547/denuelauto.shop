import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireHqAdminAuth } from '../../middleware/hqAuth';

const router = express.Router();
const prisma = new PrismaClient();
const HQ_JWT_SECRET = process.env.HQ_JWT_SECRET || 'changeme_hq_secret';
const HQ_TOKEN_NAME = 'hq_admin_token';
const TOKEN_EXPIRES_IN = process.env.HQ_JWT_EXPIRES_IN || '7d';

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const admin = await prisma.admin_users.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { adminId: admin.id, email: admin.email, role: admin.role };
  const token = jwt.sign(payload, HQ_JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

  // set cookie
  res.cookie(HQ_TOKEN_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  const adminResp = { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role };
  res.json({ admin: adminResp, message: 'Logged in' });
});

router.get('/auth/me', requireHqAdminAuth, async (req: Request, res: Response) => {
  const admin = (req as any).hqAdmin;
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });
  const dbAdmin = await prisma.admin_users.findUnique({ where: { id: admin.id } });
  if (!dbAdmin || !dbAdmin.isActive) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ admin: { id: dbAdmin.id, email: dbAdmin.email, fullName: dbAdmin.fullName, role: dbAdmin.role, isActive: dbAdmin.isActive } });
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(HQ_TOKEN_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

export default router;
