import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoyaltyService {
  async getAccount(tenantId: string, buyerId: string) {
    let acc = await prisma.loyaltyAccount.findFirst({ where: { tenantId, buyerId } });
    if (!acc) { acc = await prisma.loyaltyAccount.create({ data: { tenantId, buyerId, points: 0 } }); }
    return acc;
  }

  async awardPoints(tenantId: string, buyerId: string, amountUsd: number, pointsPerUsd = 1, refType?: string, refId?: string) {
    if (!buyerId) return null;
    const points = Math.floor(amountUsd * pointsPerUsd);
    const acc = await this.getAccount(tenantId, buyerId);
    const updated = await prisma.loyaltyAccount.update({ where: { id: acc.id }, data: { points: { increment: points } } });
    await prisma.loyaltyEvent.create({ data: { tenantId, buyerId, type: 'earn', points, refType: refType || 'payment', refId } });
    return updated;
  }

  async redeemPoints(tenantId: string, buyerId: string, points: number) {
    const acc = await this.getAccount(tenantId, buyerId);
    if (acc.points < points) throw new Error('Not enough points');
    await prisma.loyaltyAccount.update({ where: { id: acc.id }, data: { points: { decrement: points } } });
    const ev = await prisma.loyaltyEvent.create({ data: { tenantId, buyerId, type: 'redeem', points, refType: 'redeem' } });
    return ev;
  }
}

export default new LoyaltyService();
