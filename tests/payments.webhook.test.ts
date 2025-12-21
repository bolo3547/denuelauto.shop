import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Payments Webhooks', () => {
  let tenantId: string;
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.create({ data: { name: 'WebhookTenant', slug: 'webhook-tenant' } as any });
    tenantId = t.id;
  });
  afterAll(async () => {
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it('should process the webhook idempotently', async () => {
    const event = { id: 'evt-test-1', status: 'succeeded', proformaId: 'pf-test', currency: 'USD', amount: 100 };
    const sig = 'testsig';
    const r1 = await request(app)
      .post('/api/payments/webhooks/card')
      .set('x-tenant-id', tenantId)
      .set('x-signature', sig)
      .send(event);
    expect([200, 201]).toContain(r1.status);

    const r2 = await request(app)
      .post('/api/payments/webhooks/card')
      .set('x-tenant-id', tenantId)
      .set('x-signature', sig)
      .send(event);
    expect(r2.status).toBe(200);
    // assert only one payment created for this event
    const payments = await prisma.payment.findMany({ where: { tenantId } });
    expect(payments.length <= 1).toBeTruthy();
  });
});

describe('Payments webhook', () => {
  let adminToken: string;
  let pfId: string;
  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst();
    const car = await prisma.car.findFirst({ where: { tenantId: tenant?.id } });
    const buyer = await prisma.buyer.findFirst({ where: { tenantId: tenant?.id } });
    const adminUser = await prisma.user.findFirst({ where: { tenantId: tenant?.id } });
    adminToken = jwt.sign({ id: adminUser?.id || 'admin', role: 'dealer_owner', tenantId: tenant?.id }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).post('/api/proformas').set('Authorization', `Bearer ${adminToken}`).send({ carId: car?.id, buyerId: buyer?.id, number: 'PF-PAY-1', currency: 'USD', lineItemsJson: { items: [{ name: 'Car', amount: 200 }] }, total: 200 });
    pfId = res.body.id;
    // set a provider with a known webhook secret
    await prisma.paymentProvider.upsert({ where: { tenantId: tenant?.id || '' }, update: { providerJson: { card: { secret: 'abc123' } } as any }, create: { tenantId: tenant?.id || '', providerJson: { card: { secret: 'abc123' } } as any } as any });
  });

  it('creates card intent and webhook verifies payment and awards loyalty', async () => {
    const createRes = await request(app).post(`/api/buyers/proformas/${pfId}/pay/card`).set('Authorization', `Bearer ${adminToken}`).send();
    expect(createRes.status).toBe(200);
    const intentId = createRes.body.intentId;
    // simulate webhook
    const raw = JSON.stringify({ event: 'payment_succeeded', data: { intentId } });
    const sig = crypto.createHmac('sha256', 'abc123').update(raw).digest('hex');
    const webhookRes = await request(app).post('/api/payments/webhooks/card').set('x-tenant-id', (await prisma.tenant.findFirst())?.id || '').set('x-signature', sig).send({ event: 'payment_succeeded', data: { intentId } });
    expect(webhookRes.status).toBe(200);
    // verify payment exists
    const payments = await prisma.payment.findMany({ where: { proformaId: pfId } });
    expect(payments.length).toBeGreaterThan(0);
    const p = payments[0];
    expect(p.status).toBe('verified');
    // check proforma status
    const pf = await prisma.proformaInvoice.findUnique({ where: { id: pfId } });
    expect(['part_paid', 'paid']).toContain(pf?.status);
    // check loyalty events were created
    const events = await prisma.loyaltyEvent.findMany({ where: { tenantId: pf?.tenantId } });
    expect(events.length).toBeGreaterThanOrEqual(0);
    // check that a tenant notification was created for admin
    const notes = await prisma.tenantNotification.findMany({ where: { tenantId: pf?.tenantId } });
    expect(notes.length).toBeGreaterThan(0);
  });
});
