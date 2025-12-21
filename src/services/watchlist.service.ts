import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function processPriceDrop(tenantId: string, car: any, oldUsd: number | null, oldLocal: number | null, userId?: string) {
  try {
    // Record an audit entry for a price drop
    await prisma.auditLog.create({ data: { tenantId, actorType: 'system', actorId: userId || 'system', action: 'price.drop_detected', entity: 'car', entityId: car.id, beforeJson: { oldUsd, oldLocal }, afterJson: { newUsd: car.priceUsd, newLocal: car.priceLocalZmw } } as any });
    // Placeholder: notify interested watchers via push notifications
    return { ok: true };
  } catch (err) {
    console.error('processPriceDrop error', err);
    return { ok: false };
  }
}

export default { processPriceDrop };
