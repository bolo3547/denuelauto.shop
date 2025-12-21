import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Favorites', () => {
  let tenantId: string;
  let tokenBuyer: string;
  let carId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Fav Test', slug: 'fav-test' } as any });
    tenantId = t.id;
    const b = await prisma.buyer.create({ data: { tenantId, name: 'Fav Buyer' } });
    tokenBuyer = jwt.sign({ id: b.id, role: 'buyer', tenantId }, JWT_SECRET, { expiresIn: '1h' });
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'F-1', make: 'Toyota', model: 'Vitz', year: 2015, condition: 'used', status: 'published', publishToPublic: true } } as any);
    carId = car.id;
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('POST /buyer/favorites/:carId should add favorite', async () => {
    const res = await request(app).post(`/buyer/favorites/${carId}`).set('Authorization', `Bearer ${tokenBuyer}`);
    expect(res.status).toBe(201);
    expect(res.body.carId).toBe(carId);
  });

  it('DELETE /buyer/favorites/:carId should remove favorite', async () => {
    const res = await request(app).delete(`/buyer/favorites/${carId}`).set('Authorization', `Bearer ${tokenBuyer}`);
    expect(res.status).toBe(200);
  });
});
