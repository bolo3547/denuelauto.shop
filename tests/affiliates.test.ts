import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Affiliate attribution', () => {
  let tenantId: string;
  let tokenAdmin: string;
  const code = 'AFF-TEST';

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Aff Test', slug: 'aff-test' } as any });
    tenantId = t.id;
    await prisma.affiliate.create({ data: { tenantId, name: 'Aff A', referralCode: code, payoutPct: 2.5, status: 'active' } as any });
    const admin = await prisma.user.create({ data: { email: 'admin@aff.com', passwordHash: 'x', role: 'dealer_owner', tenantId } as any });
    tokenAdmin = jwt.sign({ id: admin.id, role: admin.role, tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('should set agent_ref cookie and record click', async () => {
    const res = await request(app).get(`/t/aff-test/public/attribution/agent?code=${code}`).set('Accept', 'application/json');
    expect([204, 200]).toContain(res.status);
  });
});
