import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function requireEntitlement(moduleKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Tenant context required' });
    const ent = await prisma.entitlements.findUnique({ where: { tenantId } });
    if (!ent) return res.status(403).json({ error: 'No entitlements configured' });
    const modules = (ent.modulesJson as any).modules || [];
    if (!modules.includes(moduleKey)) return res.status(403).json({ error: 'Feature not enabled for tenant' });
    next();
  };
}

export default { requireEntitlement };
