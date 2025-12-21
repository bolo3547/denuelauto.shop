import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function signPayload(secret: string, payload: any) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

describe('USSD Flow - buy car', () => {
  let tenantId: string;
  let sessionId = `sess-${Date.now()}`;
  const msisdn = '+260971234567';
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.findFirst({ where: { slug: 'sample-dealer' } });
    if (!t) throw new Error('seed not run');
    tenantId = t.id;
    process.env.USSD_SIGNING_SECRET = process.env.USSD_SIGNING_SECRET || 'secret';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('welcome -> browse quick list -> enter short code -> reserve & collect -> webhook confirm', async () => {
    // welcome
    const res1 = await request(app)
      .post('/api/ussd')
      .send({ sessionId, phoneNumber: msisdn, text: '' });
    expect(res1.text.startsWith('CON')).toBeTruthy();

    // select '1' (type of cars)
    const res2 = await request(app)
      .post('/api/ussd')
      .send({ sessionId, phoneNumber: msisdn, text: '1' });
    expect(res2.text.startsWith('CON')).toBeTruthy();

    // enter short code D1234
    const res3 = await request(app)
      .post('/api/ussd')
      .send({ sessionId, phoneNumber: msisdn, text: '*D1234' });
    expect(res3.text.includes('D1234')).toBeTruthy();

    // choose to reserve (option 1)
    const res4 = await request(app)
      .post('/api/ussd')
      .send({ sessionId, phoneNumber: msisdn, text: '*D1234*1' });
    expect(res4.text.startsWith('CON')).toBeTruthy();

    // confirm deposit
    const res5 = await request(app)
      .post('/api/ussd')
      .send({ sessionId, phoneNumber: msisdn, text: '*D1234*1*1' });
    expect(res5.text.includes('Payment prompt')).toBeTruthy();

    // Check mobilePayment created
    const mp = await prisma.mobilePayment.findFirst({ where: { tenantId, msisdn }, orderBy: { createdAt: 'desc' } });
    expect(mp).toBeTruthy();
    // Verify mtn webhook to mark payment approved
    const payload = { request_id: mp!.requestId, status: 'success' };
    const signature = signPayload(process.env.USSD_SIGNING_SECRET || 'secret', payload);
    const resx = await request(app)
      .post('/api/webhooks/mtn-momo')
      .set('x-signature', signature)
      .send(payload);
    expect(resx.status).toBe(200);
  }, 30000);
});
