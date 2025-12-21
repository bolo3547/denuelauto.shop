import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Admin Merchants', () => {
  let tenantId: string;
  let adminToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const tenant = await prisma.tenant.create({ data: { name: 'Merchants Test', slug: `merchants-test-${Date.now()}` } as any });
    tenantId = tenant.id;
    const admin = await prisma.user.create({ data: { tenantId, email: 'ops@merchants.test', role: 'ops', passwordHash: '' } as any });
    adminToken = jwt.sign({ id: admin.id, role: 'ops', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.merchant.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    await prisma.$disconnect();
  });

  it('creates and lists merchants', async () => {
    const createRes = await request(app)
      .post('/api/admin/merchants')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-tenant-id', tenantId)
      .send({ shortCode: `MC${Date.now()}`, name: 'Test Merchant', tenantId });
    expect([200, 201].includes(createRes.status)).toBeTruthy();
    expect(createRes.body.merchant).toBeTruthy();
    // list
    const listRes = await request(app).get('/api/admin/merchants').set('Authorization', `Bearer ${adminToken}`).set('x-tenant-id', tenantId);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.list)).toBeTruthy();
    expect(listRes.body.list.length).toBeGreaterThan(0);
  });
});
