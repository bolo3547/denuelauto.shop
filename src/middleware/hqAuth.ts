import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const HQ_JWT_SECRET = process.env.HQ_JWT_SECRET || 'changeme_hq_secret';
const HQ_TOKEN_NAME = 'hq_admin_token';

export interface HqAdminPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const requireHqAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.cookies && req.cookies[HQ_TOKEN_NAME]) {
      token = req.cookies[HQ_TOKEN_NAME];
    } else if (req.headers.authorization && (req.headers.authorization as string).startsWith('Bearer ')) {
      token = (req.headers.authorization as string).split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Missing hq admin token' });
    const payload = jwt.verify(token, HQ_JWT_SECRET) as HqAdminPayload;
    const admin = await prisma.admin_users.findUnique({ where: { id: payload.adminId } });
    if (!admin || !admin.isActive) return res.status(401).json({ error: 'Invalid admin token' });
    (req as any).hqAdmin = { id: admin.id, email: admin.email, role: admin.role } as HqAdminPayload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired hq token' });
  }
};

export const requireHqRole = (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const hqAdmin = (req as any).hqAdmin as HqAdminPayload | undefined;
  if (!hqAdmin) return res.status(401).json({ error: 'Unauthorized' });
  if (!allowedRoles.includes(hqAdmin.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

export default requireHqAdminAuth;
