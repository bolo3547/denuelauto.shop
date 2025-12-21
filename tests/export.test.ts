import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Export', () => {
  it('calc cif returns breakdown', async () => {
    // Create a tenant, port and rule to compute CIF
    const t = await prisma.tenant.create({ data: { name: 'Export Test', slug: 'export-test' } as any });
    const p = await prisma.exportPort.create({ data: { tenantId: t.id, name: 'Port Test', country: 'Country' } });
    const r = await prisma.exportPriceRule.create({ data: { tenantId: t.id, portId: p.id, baseUsd: 100, freightUsd: 800, insuranceRatePct: 1.5 } });
    const token = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId: t.id }, process.env.JWT_SECRET || 'changeme', { expiresIn: '1h' });
    const res = await request(app).post('/api/export/calc-cif').set('Authorization', `Bearer ${token}`).send({ portId: r.id, fobUsd: 5000, otherUsd: 50 });
    expect(res.status).toBe(200);
    expect(res.body.cif).toBeDefined();
    // cif should equal fob + freight + insurance + other
    const insurance = (1.5 / 100) * 5000;
    expect(res.body.cif).toBeCloseTo(5000 + 800 + insurance + 50);
  });
});
