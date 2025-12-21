import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function sign(payload: any) {
  const secret = process.env.USSD_SIGNING_SECRET || 'secret';
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

describe('MTN Webhook and order conversion', () => {
  let tenantId: string;
  const msisdn = '+260971234567';
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.findFirst({ where: { slug: 'sample-dealer' } });
    if (!t) throw new Error('Seed missing');
    tenantId = t.id;
    process.env.USSD_SIGNING_SECRET = process.env.USSD_SIGNING_SECRET || 'secret';
    // create a ussd cart for msisdn
    await prisma.ussdCart.create({ data: { tenantId, msisdn, stockNo: 'SAMPLE-001', status: 'held', holdExpiresAt: new Date(Date.now() + 1000 * 60 * 30) } as any });
    // create buyer
    await prisma.buyer.create({ data: { tenantId, name: 'Momo Buyer', phone: msisdn } as any });
  });

  afterAll(async () => {
    await prisma.ussdCart.deleteMany({ where: { tenantId } });
    await prisma.mobilePayment.deleteMany({ where: { tenantId } });
    await prisma.$disconnect();
  });

  it('creates mobile payment via route, webhook approves, converts to order', async () => {
    const collect = await request(app).post('/api/payments/mtn/collect').set('x-tenant-id', tenantId).send({ msisdn, amount: 1000 });
    expect(collect.status).toBe(200);
    const requestId = collect.body.request_id;
    const payload = { request_id: requestId, status: 'success' };
    const sig = sign(payload);
    const res = await request(app).post('/api/webhooks/mtn-momo').set('x-signature', sig).send(payload);
    expect(res.status).toBe(200);
    // check for order created
    const mp = await prisma.mobilePayment.findFirst({ where: { tenantId, requestId } });
    expect(mp).toBeTruthy();
    const order = await prisma.order.findFirst({ where: { tenantId, msisdn } });
    expect(order).toBeTruthy();
  });
});
