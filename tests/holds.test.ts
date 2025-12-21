import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Holds', () => {
  let tenantId: string;
  let token: string;
  let carId: string;
  let buyerId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Hold Test', slug: 'hold-test' } as any });
    tenantId = t.id;
    const b = await prisma.buyer.create({ data: { tenantId, name: 'Hold Buyer', email: 'hb@example.com' } });
    buyerId = b.id;
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'H-1', make: 'Honda', model: 'Fit', year: 2014, condition: 'used', priceUsd: 3000, priceLocalZmw: 72000, status: 'published', publishToPublic: true } } as any);
    carId = car.id;
    token = jwt.sign({ id: buyerId, role: 'buyer', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('should create hold for car', async () => {
    const res = await request(app).post(`/buyer/cars/${carId}/hold`).set('Authorization', `Bearer ${token}`).send({ hours: 24, amountUsd: 50 });
    expect(res.status).toBe(201);
    expect(res.body.carId).toBe(carId);
    expect(res.body.status).toBe('active');
  });
});
