import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Billing webhooks and entitlements', () => {
  let tenantId: string;
  let adminToken: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Billing Test', slug: 'billing-test' } as any });
    tenantId = t.id;
    const admin = await prisma.user.create({ data: { tenantId, email: 'owner@example.com', role: 'dealer_owner', passwordHash: '' } as any });
    adminToken = jwt.sign({ id: admin.id, role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
    // enable billing feature flag for the tenant
    await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { featureFlags: { billing: { enabled: true } } as any } as any } as any });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates subscription and recomputes entitlements on webhook', async () => {
    // create subscription
    const res = await request(app).post('/api/admin/billing/subscribe').set('Authorization', `Bearer ${adminToken}`).send({ planKey: 'pro', provider: 'stripe' });
    expect(res.status).toBe(200);
    const sub = res.body;
    expect(sub.planKey).toBe('pro');

    // send webhook invoice payment succeeded
    const body = { id: `evt_${Math.random().toString(36).slice(2, 8)}`, type: 'invoice.payment_succeeded', data: { id: `inv_${Math.random().toString(36).slice(2, 8)}`, amount: 100, currency: 'USD' } };
    const sig = '';
    const webhookRes = await request(app).post('/billing/webhooks/stripe').set('x-tenant-id', tenantId).set('x-signature', sig).send(body);
    expect(webhookRes.status).toBe(200);

    // Check invoice created
    const invoices = await prisma.invoice.findMany({ where: { tenantId } });
    expect(invoices.length).toBeGreaterThan(0);

    // entitlements computed
    const ent = await prisma.entitlements.findUnique({ where: { tenantId } });
    expect(ent).toBeTruthy();
    expect((ent?.modulesJson as any).modules).toContain('auto_export');

    // idempotency - send same webhook again (same id) and ensure no duplicate invoice
    const webhookRes2 = await request(app).post('/billing/webhooks/stripe').set('x-tenant-id', tenantId).set('x-signature', sig).send(body);
    expect(webhookRes2.status).toBe(200);
    const invoices2 = await prisma.invoice.findMany({ where: { tenantId } });
    expect(invoices2.length).toBe(invoices.length);
  });
});
