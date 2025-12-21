import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Reviews', () => {
  let tenantId: string;
  let tokenBuyer: string;
  let carId: string;
  let buyerId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Reviews Test', slug: 'reviews-test' } as any });
    tenantId = t.id;
    const b = await prisma.buyer.create({ data: { tenantId, name: 'R Buyer', email: 'r@example.com' } });
    buyerId = b.id;
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'R-1', make: 'Toyota', model: 'Corolla', year: 2010, condition: 'used', priceUsd: 2000, priceLocalZmw: 48000, status: 'published', publishToPublic: true } } as any);
    carId = car.id;
    const pf = await prisma.proformaInvoice.create({ data: { tenantId, carId, buyerId: buyerId, number: 'PFR-1', currency: 'USD', total: 2000, status: 'paid' } as any });
    tokenBuyer = jwt.sign({ id: buyerId, role: 'buyer', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('should allow buyer to create a review', async () => {
    const res = await request(app).post('/buyer/reviews').set('Authorization', `Bearer ${tokenBuyer}`).send({ carId, rating: 4, text: 'Good car' });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(4);
  });
});
