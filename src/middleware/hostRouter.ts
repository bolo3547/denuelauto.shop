import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function hostRouter(req: Request, res: Response, next: NextFunction) {
  try {
    const host = req.headers.host as string | undefined;
    if (!host) return next();
    const custom = await prisma.customDomain.findFirst({ where: { hostname: host, status: 'active' } as any });
    if (custom) {
      (req as any).tenantId = custom.tenantId;
      return next();
    }

    // Fallback: support {slug}.example.com
    const parts = host.split('.');
    if (parts.length > 2) {
      const slug = parts[0];
      const tenant = await prisma.tenant.findFirst({ where: { slug } as any });
      if (tenant) {
        (req as any).tenantId = tenant.id;
      }
    }
    return next();
  } catch (err) {
    console.error('hostRouter error:', err);
    return next();
  }
}

export default hostRouter;
