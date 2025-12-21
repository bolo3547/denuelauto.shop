import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Car media ingest', () => {
  let tenantId: string;
  let token: string;
  let carId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Media Test', slug: 'media-test' } as any });
    tenantId = t.id;
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'M-1', make: 'Mini', model: 'Test', year: 2020, condition: 'new', priceUsd: 10000, priceLocalZmw: 240000, status: 'published', publishToPublic: true } } as any);
    carId = car.id;
    token = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('ingests a base64 image and stores metadata', async () => {
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9XqQ9QAAAABJRU5ErkJggg==';
    const res = await request(app).post(`/api/cars/${carId}/media/ingest`).set('Authorization', `Bearer ${token}`).send({ base64 });
    expect(res.status).toBe(201);
    expect(res.body.ingest).toBeDefined();
    expect(res.body.ingest.qualityScore).toBeDefined();
    expect(res.body.media).toBeDefined();
    expect(res.body.media.url).toBeTruthy();
  });
});
