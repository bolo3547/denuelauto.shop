import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import loyaltyService from './loyalty.service';

const prisma = new PrismaClient();

// Simple stubbed gateway to create PaymentIntent records and simulate provider responses
export class PaymentService {
  async createCardIntent(tenantId: string, proformaId: string | undefined, buyerId: string | undefined, amount: number, currency = 'USD') {
    const clientSecret = crypto.randomBytes(24).toString('hex');
    const pi = await prisma.paymentIntent.create({ data: { tenantId, proformaId, buyerId, provider: 'card', amount: amount as any, currency, clientSecret, status: 'requires_action' } });
    // return client_secret (simulate stripe-like flow)
    return { clientSecret, pi };
  }

  async createPaypalIntent(tenantId: string, proformaId: string | undefined, buyerId: string | undefined, amount: number, currency = 'USD') {
    const approvalUrl = `https://paypal.mock/approve/${crypto.randomBytes(16).toString('hex')}`;
    const pi = await prisma.paymentIntent.create({ data: { tenantId, proformaId, buyerId, provider: 'paypal', amount: amount as any, currency, providerMeta: { approvalUrl }, status: 'pending' } });
    return { approvalUrl, pi };
  }

  async getIntent(tenantId: string, id: string) {
    const pi = await prisma.paymentIntent.findUnique({ where: { id } });
    if (!pi || pi.tenantId !== tenantId) throw new Error('Not found');
    return pi;
  }

  async markIntentSucceeded(id: string, providerEvent?: any) {
    const pi = await prisma.paymentIntent.update({ where: { id }, data: { status: 'succeeded', metaJson: providerEvent } });
    // create Payment record referenced against proforma as verified
    if (pi.proformaId && pi.amount) {
      const p = await prisma.payment.create({ data: {
        id: crypto.randomBytes(16).toString('hex'),
        tenant: { connect: { id: pi.tenantId } },
        ref: `intent_${pi.id}`,
        proformaId: pi.proformaId,
        buyerId: pi.buyerId,
        method: pi.provider ?? 'unknown',
        currency: pi.currency ?? 'USD',
        amount: pi.amount as any,
        status: 'verified',
        receivedAt: new Date(),
        updatedAt: new Date(),
        hash: crypto.createHash('sha256').update(id).digest('hex')
      } });
      // update proforma status
      const pf = await prisma.proformaInvoice.findUnique({ where: { id: pi.proformaId } });
      if (pf) {
        // decide status change: if fully paid -> 'paid', else 'part_paid' (prorate by total)
        const paid = Number(pf.total || 0) - 0; // naive - we should sum payments
        // compute sum of payments for proforma
        const payments = await prisma.payment.findMany({ where: { proformaId: pf.id, status: 'verified' } });
        let sum = 0;
        for (const pay of payments) sum += Number(pay.amount || 0);
        const newStatus = sum >= Number(pf.total || 0) ? 'paid' : 'part_paid';
        await prisma.proformaInvoice.update({ where: { id: pf.id }, data: { status: newStatus } });
      }
      // award loyalty points for verified payment
      if (pi.buyerId && pi.tenantId && pi.amount) {
        const tenant = await prisma.tenant.findUnique({ where: { id: pi.tenantId } });
        const pointsPerUsd = (tenant?.settings as any)?.loyalty?.points_per_usd || 1;
        // pass refType/refId so loyalty event links to Payment id
        await loyaltyService.awardPoints(pi.tenantId, pi.buyerId, Number(pi.amount), pointsPerUsd, 'payment', (p as any).id);
      }
      return p;
    }
    return pi;
  }
}

export default new PaymentService();
