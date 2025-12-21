import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to enforce tenant isolation by scoping all queries to the tenant_id
 */
export const tenantIsolation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({ error: 'Tenant ID is required in the x-tenant-id header.' });
    }

    // Attach tenantId to the request object for downstream use
    req.tenantId = tenantId;

    // Optionally, validate tenant existence in the database
    const tenantExists = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenantExists) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    next();
  } catch (error) {
    console.error('Tenant isolation error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
