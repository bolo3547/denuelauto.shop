import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import * as notifications from '../src/utils/notifications';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Watchlist price drop alerts', () => {
  let tenant: any;
  let car: any;
  let adminToken: string;
  beforeAll(async () => {
    tenant = await prisma.tenant.create({ data: { name: 'Watch Tenant', slug: 'watch-tenant', theme: {}, settings: { watchlistDebounceMinutes: 10 } } as any });
    // create a buyer user to act as admin's tenant
    const user = await prisma.user.create({ data: { email: 'admin@test', passwordHash: 'x', role: 'dealer_owner', tenantId: tenant.id } });
    // token with actual user
    adminToken = jwt.sign({ id: user.id, role: 'dealer_owner', tenantId: tenant.id }, JWT_SECRET, { expiresIn: '1h' });
    car = await prisma.car.create({ data: { tenantId: tenant.id, stockNo: 'S-100', make: 'Toyota', model: 'Corolla', year: 2019, priceUsd: 10000, priceLocalZmw: 0, status: 'published', publishToPublic: true, publishToExport: true } });
  });

  afterAll(async () => {
    await prisma.watchlist.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.car.delete({ where: { id: car.id } });
    await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.$disconnect();
  });

  test('Subscribe, lower price and get one alert', async () => {
    const spyEmail = jest.spyOn(notifications, 'sendEmail').mockResolvedValueOnce(true);
    const spyWhatsapp = jest.spyOn(notifications, 'sendWhatsApp').mockResolvedValueOnce(true);
    // subscribe via public route
    const res = await request(app).post(`/t/${tenant.slug}/public/watchlist`).send({ carId: car.id, email: 'user@example.com' });
    expect(res.status).toBe(201);
    // lower price
    const resPatch = await request(app).patch(`/api/cars/${car.id}`).set('Authorization', `Bearer ${adminToken}`).send({ priceUsd: 9000 });
    expect(resPatch.status).toBe(200);
    // notify sent
    expect(spyEmail).toHaveBeenCalled();
    spyEmail.mockRestore();
    spyWhatsapp.mockRestore();
  });

  test('Lower price again within debounce should not send another alert', async () => {
    const spyEmail = jest.spyOn(notifications, 'sendEmail').mockResolvedValue(true);
    // lower price again
    const resPatch = await request(app).patch(`/api/cars/${car.id}`).set('Authorization', `Bearer ${adminToken}`).send({ priceUsd: 8500 });
    expect(resPatch.status).toBe(200);
    // no calls due to debounce
    expect(spyEmail).not.toHaveBeenCalled();
    spyEmail.mockRestore();
  });

  test('Unpublish car -> no alerts on price change', async () => {
    const spyEmail = jest.spyOn(notifications, 'sendEmail').mockResolvedValue(true);
    // unpublish car
    let res = await request(app).patch(`/api/cars/${car.id}`).set('Authorization', `Bearer ${adminToken}`).send({ publishToPublic: false, priceUsd: 7000 });
    expect(res.status).toBe(200);
    expect(spyEmail).not.toHaveBeenCalled();
    spyEmail.mockRestore();
  });
});
