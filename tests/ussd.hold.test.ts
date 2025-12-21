import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('USSD hold idempotency', () => {
  let tenantId: string;
  const msisdn = '+260971234567';
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.findFirst({ where: { slug: 'sample-dealer' } });
    if (!t) throw new Error('seed missing');
    tenantId = t.id;
  });
  afterAll(async () => {
    await prisma.ussdCart.deleteMany({ where: { tenantId } });
    await prisma.$disconnect();
  });

  it('creates a hold and returns same record on repeated calls', async () => {
    const payload = { tenantId, msisdn, stockNo: 'SAMPLE-001' };
    const r1 = await request(app).post('/api/ussd/hold').send(payload);
    expect(r1.status).toBe(200);
    expect(r1.body.ok).toBeTruthy();
    const r2 = await request(app).post('/api/ussd/hold').send(payload);
    expect(r2.status).toBe(200);
    expect(r2.body.alreadyHeld).toBeTruthy();
  });
});
