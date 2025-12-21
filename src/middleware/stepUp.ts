import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const STEPUP_SECRET = process.env.STEPUP_SECRET || 'stepup_secret';

export function signStepUpToken(userId: string) {
  return jwt.sign({ id: userId }, STEPUP_SECRET, { expiresIn: '2m' });
}

export function requireStepUp(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-stepup-token'] as string | undefined;
  if (!token) return res.status(401).json({ error: 'Step-up token required' });
  try {
    const payload: any = jwt.verify(token, STEPUP_SECRET);
    // verify that token user matches the JWT user
    const user = (req as any).user;
    if (!user || user.id !== payload.id) return res.status(403).json({ error: 'Invalid step-up' });
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid step-up token' });
  }
}
