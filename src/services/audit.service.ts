import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditEntry {
  tenantId: string;
  actorId?: string | null;
  actorType?: string | null;
  action: string;
  before?: any;
  after?: any;
  meta?: any;
}

export async function recordAudit(entry: AuditEntry) {
  const { tenantId, actorId, action, before, after, meta } = entry;
  try {
    const audit = await prisma.auditLog.create({
      data: {
        tenantId,
        actorType: entry.actorType ?? 'system',
        actorId: actorId ?? 'system',
        action,
        entity: 'unknown',
        entityId: 'unknown',
        beforeJson: before ?? undefined,
        afterJson: after ?? undefined,
        metaJson: meta ?? undefined,
      },
    });

    return audit;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    throw error;
  }
}
