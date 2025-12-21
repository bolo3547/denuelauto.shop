import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Car media upload', () => {
  let tenantId: string;
  let token: string;
  let carId: string;

  beforeAll(async () => {
    const t = await prisma.tenant.create({ data: { name: 'Upload Media', slug: 'upload-media' } as any });
    tenantId = t.id;
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'U-1', make: 'Mini', model: 'Upload', year: 2020, condition: 'new', priceUsd: 10000, priceLocalZmw: 240000, status: 'published', publishToPublic: true } } as any);
    carId = car.id;
    token = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('uploads a small file and stores metadata', async () => {
    const png = Buffer.from('89504E470D0A1A0A0000000D4948445200000001000000010806000000', 'hex');
    const res = await request(app).post(`/api/cars/${carId}/media/upload`).set('Authorization', `Bearer ${token}`).attach('file', png, { filename: 'test.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.ingest).toBeDefined();
    expect(res.body.media).toBeDefined();
    expect(res.body.media.url).toBeTruthy();
  });
});
