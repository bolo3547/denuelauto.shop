import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function tenantResolver(req: Request, res: Response, next: NextFunction) {
  const slug = req.params?.slug || req.query?.slug || (req as any).tenantSlug;
  if (!slug) return next();
  const t = await prisma.tenant.findUnique({ where: { slug } });
  if (!t) return next();
  req['tenantId'] = t.id;
  req['tenantSlug'] = t.slug;
  next();
}

export default { tenantResolver };
