import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Trade-ins', () => {
  let tenantId: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Trade Test', slug: 'trade-test' } as any });
    tenantId = t.id;
    tokenAdmin = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/trade-ins creates a trade-in and returns 201', async () => {
    const res = await request(app).post('/api/trade-ins').set('Authorization', `Bearer ${tokenAdmin}`).send({ ownerName: 'John', make: 'Toyota', model: 'Axio', year: 2010 });
    expect(res.status).toBe(201);
    expect(res.body.ownerName).toBe('John');
  });
});
