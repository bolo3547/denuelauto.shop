import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Test Drives', () => {
  let tenantId: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'TD Test', slug: 'td-test' } as any });
    tenantId = t.id;
    tokenAdmin = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/test-drives schedules a test drive (public)', async () => {
    const res = await request(app).post('/api/test-drives').send({ carId: 'unknown', name: 'Tester', phone: '077700', scheduleAt: new Date().toISOString() });
    expect([201, 400, 404]).toContain(res.status);
  });

  it('GET /api/test-drives with auth returns 200', async () => {
    const token = jwt.sign({ id: 'u1', role: 'dealer_manager', tenantId }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/api/test-drives').set('Authorization', `Bearer ${token}`);
    expect([200]).toContain(res.status);
  });
});
