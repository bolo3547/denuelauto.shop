import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function requireFeature(featureKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Tenant context required' });
    const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const ff = (t?.settings as any)?.featureFlags || {};
    if (!ff[featureKey]) return res.status(403).json({ error: 'Feature disabled' });
    next();
  };
}

export default { requireFeature };
