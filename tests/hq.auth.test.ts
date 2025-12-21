import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('HQ Admin auth flow', () => {
  let agent: any;
  let adminEmail = `hq-${Date.now()}@example.com`;
  let adminPassword = 'HelloHQ123!';
  let adminId: string | undefined;

  beforeAll(async () => {
    await prisma.$connect();
    const hash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.admin_users.create({ data: { email: adminEmail, passwordHash: hash, fullName: 'HQ Test', role: 'SUPER_ADMIN' } });
    adminId = admin.id;
    agent = request.agent(app);
  });

  afterAll(async () => {
    if (adminId) await prisma.admin_users.delete({ where: { id: adminId } } as any);
    await prisma.$disconnect();
  });

  it('should login successfully and set cookie', async () => {
    const res = await agent.post('/api/hq/auth/login').send({ email: adminEmail, password: adminPassword });
    expect(res.status).toBe(200);
    expect(res.body.admin).toBeTruthy();
  });

  it('should confirm me returns admin', async () => {
    const res = await agent.get('/api/hq/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.admin.email).toBe(adminEmail);
  });

  it('should allow listing tenants for SUPER_ADMIN', async () => {
    const res = await agent.get('/api/hq/tenants');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tenants)).toBeTruthy();
  });

  it('should logout and block me after', async () => {
    const res = await agent.post('/api/hq/auth/logout');
    expect(res.status).toBe(200);
    const me = await agent.get('/api/hq/auth/me');
    expect(me.status).toBe(401);
  });
});
