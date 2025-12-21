import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl } = req;
  const actor = (req as any).user;
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    // only log non-GET events for brevity
    if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      try {
        await prisma.auditLog.create({
          data: {
            actorType: actor ? actor.type : 'public',
            actorId: actor ? actor.id : '',
            tenantId: (req as any).tenantId || actor?.tenantId || '',
            action: `${method} ${originalUrl}`,
            entity: originalUrl.split('/')[1] || 'unknown',
            entityId: req.params.id || '',
            ip: req.ip,
            ua: req.headers['user-agent'] || '',
            beforeJson: undefined,
            afterJson: { body: req.body, status: res.statusCode },
          },
        });
      } catch (err) {
        console.error('Failed to write audit log', err);
      }
    }
  });
  next();
};

