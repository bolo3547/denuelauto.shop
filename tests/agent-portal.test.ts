import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Agent Portal', () => {
  let tenantId: string;
  let agentId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Agent Portal Test', slug: 'agent-test' } as any });
    tenantId = t.id;
    const a = await prisma.agent.create({ data: { tenantId, name: 'Agent Portal', email: 'portal@agent.com', phone: '077701', commissionPercent: 5.0, status: 'active', portalAccess: true } as any });
    agentId = a.id;
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('agent auth and /me endpoint', async () => {
    const loginRes = await request(app).post(`/t/agent-test/agent/auth/login`).send({ email: 'portal@agent.com' });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    const me = await request(app).get(`/t/agent-test/agent/me`).set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('portal@agent.com');
  });
});
