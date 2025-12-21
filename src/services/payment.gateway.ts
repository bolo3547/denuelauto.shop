import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import cryptoService from './crypto';

const prisma = new PrismaClient();

// Mock gateway service - emulates card/paypal/momo provider interactions
export default {
  async createCardIntent(tenantId: string, proformaId: string, buyerId: string, amount: number, currency = 'USD') {
    const clientSecret = crypto.randomBytes(16).toString('hex');
    const pi = await prisma.paymentIntent.create({ data: { tenantId, proformaId, buyerId, amount: amount as any, currency, provider: 'card', clientSecret, status: 'requires_action' } as any });
    return { pi, clientSecret };
  },
  async createPaypalIntent(tenantId: string, proformaId: string, buyerId: string, amount: number, currency = 'USD') {
    const approvalUrl = `https://mock.paypal/approve?token=${crypto.randomBytes(8).toString('hex')}`;
    const pi = await prisma.paymentIntent.create({ data: { tenantId, proformaId, buyerId, amount: amount as any, currency, provider: 'paypal', approvalUrl, status: 'pending' } as any });
    return { pi, approvalUrl };
  },
  async createMomoIntent(tenantId: string, proformaId: string, buyerId: string, amount: number, currency = 'USD') {
    const pi = await prisma.paymentIntent.create({ data: { tenantId, proformaId, buyerId, amount: amount as any, currency, provider: 'momo', status: 'pending' } as any });
    // Mock: send a poll id
    return { pi, pollId: pi.id };
  },
  async markIntentSucceeded(id: string, event: any) {
    const pi = await prisma.paymentIntent.update({ where: { id }, data: { status: 'succeeded', metaJson: event as any } as any });
    // create payment record
    const payment = await prisma.payment.create({ data: { tenantId: pi.tenantId, ref: `GW-${pi.id}`, proformaId: pi.proformaId, buyerId: pi.buyerId, amount: pi.amount as any, method: pi.provider, currency: pi.currency, status: 'verified', receivedAt: new Date() } as any });
    return payment;
  }
,
  // verify signature and dedupe webhook events based on provider secret stored in PaymentProvider
  async verifyAndRecordWebhook(tenantId: string, provider: string, eventId: string, signature: string | undefined, rawPayload: string) {
    // dedupe: check if event already exists
    const existing = await prisma.webhookEvent.findUnique({ where: { eventId } }).catch(() => null);
    if (existing) return { ok: false, duplicate: true, existing };
    // get provider secret (if any) from paymentProvider table
    const p = await prisma.paymentProvider.findUnique({ where: { tenantId } });
    let secret: string | undefined;
    try {
      // try card json encrypted or plaintext
      // providerJson may be nested with keys for each provider: { card: {...}, paypal: {...}, momo: {...} }
      const providerJson = (p as any)?.providerJson || {};
      if (providerJson && providerJson.card) {
        if ((providerJson.card as any).encrypted) {
          const parsed = cryptoService.decryptJSON((providerJson.card as any).encrypted);
          secret = parsed?.secret;
        } else if ((providerJson.card as any).secret) {
          secret = (providerJson.card as any).secret;
        }
      }
      // fallback: try paypalJson encrypted or plaintext
      if (!secret && providerJson && providerJson.paypal) {
        if ((providerJson.paypal as any).encrypted) {
          const parsed = cryptoService.decryptJSON((providerJson.paypal as any).encrypted);
          secret = parsed?.webhookSecret || parsed?.secret;
        } else if ((providerJson.paypal as any).webhookSecret || (providerJson.paypal as any).secret) {
          secret = (providerJson.paypal as any).webhookSecret || (providerJson.paypal as any).secret;
        }
      }
    } catch (e) {
      // ignore - unknown format
    }
    // if secret available, verify HMAC signature (SHA256) in header
    if (secret && signature) {
      const computed = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
      if (computed !== signature) return { ok: false, duplicate: false, reason: 'signature_mismatch' };
    }
    // store event
    await prisma.webhookEvent.create({ data: { tenantId, provider, eventId, signature, payload: JSON.parse(rawPayload) } as any });
    return { ok: true, duplicate: false };
  }
};
