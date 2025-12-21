import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function hostTenantResolver(req: Request, res: Response, next: NextFunction) {
  const host = (req.headers.host || '').split(':')[0];
  if (!host) return next();
  try {
    // Some schemas may not have CustomDomain; skip gracefully if the model is missing.
    const customDomainModel = (prisma as any).customDomain;
    if (!customDomainModel || typeof customDomainModel.findUnique !== 'function') return next();

    const dom = await customDomainModel.findUnique({ where: { hostname: host } });
    if (!dom) return next();
    // set the tenant context
    req['tenantId'] = dom.tenantId;
    // if tenant slug not set, fetch tenant (guard against missing tenant model)
    const tenantModel = (prisma as any).tenant;
    if (!req['tenantSlug'] && tenantModel?.findUnique) {
      const t = await tenantModel.findUnique({ where: { id: dom.tenantId } });
      if (t) req['tenantSlug'] = t.slug;
    }
    return next();
  } catch (err) {
    // Avoid crashing requests due to optional domain mapping
    console.warn('hostTenantResolver skipped due to error:', err);
    return next();
  }
}

export default { hostTenantResolver };
