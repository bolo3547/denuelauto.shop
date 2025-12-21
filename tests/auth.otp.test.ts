import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth OTP & Register', () => {
  let tenantId: string;
  beforeAll(async () => {
    await prisma.$connect();
    const t = await prisma.tenant.create({ data: { name: 'OTP Test Tenant', slug: `otp-${Date.now()}` } as any });
    tenantId = t.id;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('send, verify OTP and register user', async () => {
    const email = `otp-${Date.now()}@example.com`;
    const sendRes = await request(app).post('/api/auth/otp/send').send({ contact: email, tenantId });
    expect(sendRes.status).toBe(200);

    // look up code in DB
    const otp = await prisma.oneTimeCode.findFirst({ where: { contact: email }, orderBy: { createdAt: 'desc' } });
    expect(otp).toBeTruthy();

    // verify
    const verifyRes = await request(app).post('/api/auth/otp/verify').send({ contact: email, code: otp!.code });
    expect(verifyRes.status).toBe(200);

    // register
    const registerRes = await request(app).post('/api/auth/register').send({ email, password: 'Str0ngPass!', fullName: 'Test User', phone: '+260971234567', tenantId });
    expect(registerRes.status).toBe(200);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user.email).toBe(email);
  });
});
