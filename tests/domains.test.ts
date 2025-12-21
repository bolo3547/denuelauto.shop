import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Custom Domains', () => {
  let tenantId: string;
  let adminToken: string;
  let domainId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Domains Test', slug: 'domains-test' } as any });
    tenantId = t.id;
    const admin = await prisma.user.create({ data: { tenantId, email: 'owner@domain.com', role: 'dealer_owner', passwordHash: '' } as any });
    adminToken = jwt.sign({ id: admin.id, role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates domain and verifies via token', async () => {
    const createRes = await request(app).post('/api/admin/domains').set('Authorization', `Bearer ${adminToken}`).send({ hostname: 'test-d1.example' });
    expect(createRes.status).toBe(200);
    const { domain, instructions } = createRes.body;
    expect(domain).toBeTruthy();
    domainId = domain.id;

    // verify using manual token
    const verifyRes = await request(app).post(`/api/admin/domains/${domainId}/verify`).set('Authorization', `Bearer ${adminToken}`).send({ verifyToken: instructions.addTxt.value });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.status).toBe('active');
  });
});
