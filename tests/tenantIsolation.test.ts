import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Tenant isolation', () => {
  let tenantA: any;
  let tenantB: any;
  let tokenB: string;

  beforeAll(async () => {
    tenantA = await prisma.tenant.create({ data: { name: 'Tenant A', slug: 'tenant-a' } as any });
    tenantB = await prisma.tenant.create({ data: { name: 'Tenant B', slug: 'tenant-b' } as any });
    await prisma.car.create({ data: { tenantId: tenantA.id, stockNo: 'A-1', make: 'Toyota', model: 'X', year: 2020, condition: 'used', status: 'published' } } as any);

    tokenB = jwt.sign({ id: 'admin-b', role: 'dealer_owner', tenantId: tenantB.id }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('tenant B admin should not see tenant A cars', async () => {
    const res = await request(app).get('/api/cars').set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect((res.body as any[]).length).toBe(0);
  });
});
