import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Sales pipeline', () => {
  let tenantId: string;
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.create({ data: { name: 'Test Tenant', slug: 'test-tenant' } as any });
    tenantId = t.id;
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it('should create quote, proforma -> record and verify payment', async () => {
    const createQuoteResp = await request(app)
      .post('/admin/quotes')
      .set('x-tenant-id', tenantId)
      .send({ leadId: 'lead1', carId: 'car1', currency: 'USD', price: 1000 });
    expect(createQuoteResp.status).toBe(201);

    const createPfResp = await request(app)
      .post('/admin/proformas')
      .set('x-tenant-id', tenantId)
      .send({ buyerId: 'buyer1', carId: 'car1', currency: 'USD', linesJson: [], subtotal: 1000, taxes: 0, total: 1000 });
    expect(createPfResp.status).toBe(201);
    const pf = createPfResp.body;

    const recorded = await request(app)
      .post('/admin/payments/record')
      .set('x-tenant-id', tenantId)
      .send({ proformaId: pf.id, method: 'transfer', currency: 'USD', amount: 1000, proofUrl: 'http://example.com/proof.jpg' });
    expect(recorded.status).toBe(201);
    const payment = recorded.body;

    // Verify payment with step-up token
    const verify = await request(app)
      .patch(`/admin/payments/${payment.id}/verify`)
      .set('x-tenant-id', tenantId)
      .set('x-stepup-token', process.env.STEPUP_TEST_TOKEN || 'stepup_secret_test')
      .send();
    expect(verify.status).toBe(200);
    expect(verify.body.proforma.status === 'paid' || verify.body.proforma.status === 'part_paid').toBeTruthy();
  });
});
