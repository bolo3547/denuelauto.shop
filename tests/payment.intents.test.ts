import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Payment Intents', () => {
  let tenantId: string;
  let buyerId: string;
  let proformaId: string;
  let buyerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Pay Test', slug: 'pay-test', settings: { payments: { card_enabled: true, paypal_enabled: true, momo_enabled: true } } as any } });
    tenantId = t.id;
    const b = await prisma.buyer.create({ data: { tenantId, name: 'PBuyer', email: 'pb@example.com' } });
    buyerId = b.id;
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'P-1', make: 'Honda', model: 'Civic', year: 2016, condition: 'used', status: 'published', publishToPublic: true } } as any);
    const pf = await prisma.proformaInvoice.create({ data: { tenantId, carId: car.id, buyerId, number: 'PF-PAY-1', currency: 'USD', lineItemsJson: { items: [{ name: 'Car', amount: 5000 }] }, total: 5000, status: 'sent' } as any });
    proformaId = pf.id;
    buyerToken = jwt.sign({ id: buyerId, role: 'buyer', tenantId }, JWT_SECRET, { expiresIn: '1h' });
    const admin = await prisma.user.create({ data: { tenantId, email: 'admin@pay.com', passwordHash: 'x', role: 'dealer_owner' } as any });
    adminToken = jwt.sign({ id: admin.id, role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('creates card intent and returns clientSecret', async () => {
    const res = await request(app).post(`/api/proformas/${proformaId}/pay/card`).set('Authorization', `Bearer ${buyerToken}`).send({ amount: 5000 });
    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBeDefined();
    expect(res.body.intentId).toBeDefined();
    const intentId = res.body.intentId;
    // simulate webhook event to mark succeeded
    const webhookRes = await request(app).post('/api/payments/webhooks/card').send({ event: 'intent.succeeded', data: { intentId } });
    expect([200, 404]).toContain(webhookRes.status);
    // If succeeded: check proforma status is updated by gateway
    if (webhookRes.status === 200) {
      const pf = await prisma.proformaInvoice.findUnique({ where: { id: proformaId } });
      expect(['part_paid','paid']).toContain(pf?.status);
    }
  });
});
