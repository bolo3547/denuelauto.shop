import { PrismaClient } from '@prisma/client';
import notifications, { NotificationTemplates } from '../utils/notifications';

const prisma = new PrismaClient();

// Simple in-memory plan definitions; in production this should be a DB table or config store
const PLANS: Record<string, any> = {
  free: { modules: ['marketplace'], limits: { listings: 10 } },
  pro: { modules: ['marketplace', 'auto_export', 'agents'], limits: { listings: 100 } },
  enterprise: { modules: ['marketplace', 'auto_export', 'agents', 'pwa', 'push', 'loyalty'], limits: { listings: 1000 } }
};

export async function createCustomer(tenantId: string, provider: string, meta: any = {}) {
  // mock: create a customer record (in reality call Stripe/PayPal SDK)
  const customerId = `CUST_${Math.random().toString(36).slice(2, 10)}`;
  const upsert = await prisma.billingAccount.upsert({ where: { tenantId }, update: { provider, customerId, metaJson: meta }, create: { tenantId, provider, customerId, metaJson: meta } });
  return upsert;
}

export async function createSubscription(tenantId: string, provider: string, planKey: string) {
  // mock subscription creation
  const subscriptionId = `SUB_${Math.random().toString(36).slice(2, 10)}`;
  const status = 'active';
  const ent = PLANS[planKey] || PLANS['free'];
  const sub = await prisma.billingSubscription.create({ data: { tenantId, provider, subscriptionId, planKey, status, entitlementsJson: ent, currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000) } as any });
  // set entitlements
  await prisma.entitlements.upsert({ where: { tenantId }, update: { modulesJson: ent }, create: { tenantId, modulesJson: ent } });
  return sub;
}

export async function cancelSubscription(tenantId: string, subscriptionId: string) {
  const sub = await prisma.billingSubscription.findFirst({ where: { tenantId, subscriptionId } });
  if (!sub) throw new Error('Not found');
  const updated = await prisma.billingSubscription.update({ where: { id: sub.id }, data: { status: 'cancelled' } });
  // recompute entitlements: set to free plan by default
  const ent = PLANS['free'];
  await prisma.entitlements.upsert({ where: { tenantId }, update: { modulesJson: ent }, create: { tenantId, modulesJson: ent } });
  return updated;
}

export async function computeEntitlementsForTenant(tenantId: string) {
  const sub = await prisma.billingSubscription.findFirst({ where: { tenantId, status: 'active' }, orderBy: { updatedAt: 'desc' } });
  let ent = PLANS['free'];
  if (sub && sub.planKey && PLANS[sub.planKey]) ent = PLANS[sub.planKey];
  // Also merge usage limits if needed (not implemented yet)
  await prisma.entitlements.upsert({ where: { tenantId }, update: { modulesJson: ent }, create: { tenantId, modulesJson: ent } });
  return ent;
}

export async function handleBillingWebhook(tenantId: string, provider: string, event: any) {
  // idempotency should be handled by webhook event table; caller should have recorded it already
  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
    const data = event.data || {};
    const invoiceId = data.id || data.invoice_id || `INV_${Math.random().toString(36).slice(2, 10)}`;
    const amount = data.amount || data.amount_paid || 0;
    await prisma.invoice.create({ data: { tenantId, provider, invoiceId, amount: amount as any, currency: data.currency || 'USD', url: data.url || '', status: 'paid', issuedAt: new Date() } as any }).catch(() => null);
    // Notify a tenant admin about received payment
    try {
      const admin = await prisma.user.findFirst({ where: { tenantId, role: 'admin' } }).catch(() => null);
      if (admin) {
        const ev = {
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment of ${data.currency || 'USD'} ${Number(amount).toLocaleString()} received.`,
        } as any;
        await notifications.notifyUser(tenantId, admin.id, ev).catch(() => null);
      }
    } catch (err) {
      console.error('notify admin payment received error', err);
    }
  }
  // if subscription.update or subscription.deleted events come in, update our subscription model
  if (event.type === 'customer.subscription.updated' || event.type === 'subscription.updated') {
    const s = event.data?.object || event.data;
    const subscriptionId = s.id;
    const status = s.status || 'active';
    await prisma.billingSubscription.upsert({ where: { tenantId_subscriptionId: { tenantId, subscriptionId } as any }, update: { status, entitlementsJson: s.plan || undefined }, create: { tenantId, provider, subscriptionId, planKey: (s.plan?.nickname || 'unknown'), status, entitlementsJson: s.plan } as any }).catch(() => null);
    await computeEntitlementsForTenant(tenantId);
  }
  return { ok: true };
}

export async function getEntitlements(tenantId: string) {
  const ent = await prisma.entitlements.findUnique({ where: { tenantId } });
  if (!ent) return computeEntitlementsForTenant(tenantId);
  return ent.modulesJson;
}

export async function incrementUsage(tenantId: string, meterKey: string, qty: number = 1) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const existing = await prisma.usageMeter.findFirst({ where: { tenantId, meterKey, windowStart: start as any, windowEnd: end as any } });
  if (existing) {
    const updated = await prisma.usageMeter.update({ where: { id: existing.id }, data: { qty: { increment: qty } as any } as any });
    return updated;
  }
  const created = await prisma.usageMeter.create({ data: { tenantId, meterKey, qty, windowStart: start as any, windowEnd: end as any } as any });
  return created;
}

export default { createCustomer, createSubscription, cancelSubscription, computeEntitlementsForTenant, handleBillingWebhook, getEntitlements, incrementUsage };
