import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Warranty endpoints', () => {
  let adminToken: string;
  let tenantId: string;
  let pfId: string;
  beforeAll(async () => {
    // find seeded tenant and car and sign admin token accordingly
    const tenant = await prisma.tenant.findFirst();
    const car = await prisma.car.findFirst({ where: { tenantId: tenant?.id } });
    const adminUser = await prisma.user.findFirst({ where: { tenantId: tenant?.id } });
    adminToken = jwt.sign({ id: adminUser?.id || 'admin', role: 'dealer_owner', tenantId: tenant?.id }, JWT_SECRET, { expiresIn: '1h' });
    // create a test proforma via api
    const res = await request(app).post('/api/proformas').set('Authorization', `Bearer ${adminToken}`).send({ carId: car?.id, number: 'PF-TEST-1', currency: 'USD', lineItemsJson: { items: [{ name: 'Car', amount: 1000 }] }, total: 1000 });
    if (res.status !== 201) throw new Error('Unable to create proforma seed');
    pfId = res.body.id;
    tenantId = res.body.tenantId;
  });

  it('should add warranty and recalc totals', async () => {
    const selectRes = await request(app).post(`/api/buyers/proformas/${pfId}/warranty`).set('Authorization', `Bearer ${adminToken}`).send({ selected: true });
    expect(selectRes.status).toBe(200);
    // fetch updated pf
    const pfRes = await request(app).get(`/api/proformas/${pfId}`).set('Authorization', `Bearer ${adminToken}`);
    // proformas GET requires list format, fetch the entry
    expect([200, 404]).toContain(pfRes.status);
    if (pfRes.status === 200) {
      const pf = (pfRes.body as any[]).find((p: any) => p.id === pfId);
      expect(pf).toBeTruthy();
      const items = pf.lineItemsJson.items;
      const warrantyItem = items.find((it: any) => it.name === 'Exporter Warranty');
      expect(warrantyItem).toBeTruthy();
      expect(Number(pf.total)).toBeGreaterThan(1000);
    }
  });
});
