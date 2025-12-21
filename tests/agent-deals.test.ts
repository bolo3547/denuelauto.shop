import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Agent Deals & Commission', () => {
  let tenantId: string | null = null;
  let tokenAdmin: string;
  let agentId: string;
  let carId: string;
  let proformaId: string;

  beforeAll(async () => {
    // setup: create a tenant and seed items using prisma
    const t = await prisma.tenant.create({ data: { name: 'Deal Test', slug: 'deal-test' } as any });
    tenantId = t.id;
    // create a car
    const car = await prisma.car.create({ data: { tenantId, stockNo: 'D-1', make: 'Test', model: 'X', year: 2020, condition: 'used', priceUsd: 10000, status: 'published', publishToPublic: true } } as any);
    carId = car.id;
    const agent = await prisma.agent.create({ data: { tenantId, name: 'Test Agent', commissionPercent: 5, status: 'active' } });
    agentId = agent.id;
    const buyer = await prisma.buyer.create({ data: { tenantId, name: 'Buyer 1', email: 'b@example.com' } });
    const pf = await prisma.proformaInvoice.create({ data: { tenantId, carId, buyerId: buyer.id, number: 'PF-TEST', currency: 'USD', total: 10000, status: 'sent' } });
    proformaId = pf.id;
    // admin token
    tokenAdmin = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('create an agent deal and compute commission upon paid', async () => {
    const resCreate = await request(app).post('/api/agent-deals').set('Authorization', `Bearer ${tokenAdmin}`).send({ agentId, carId, buyerId: null, stage: 'lead' });
    expect(resCreate.status).toBe(201);
    const deal = resCreate.body;
    expect(deal.agentId).toBe(agentId);

    const resPatch = await request(app).patch(`/api/agent-deals/${deal.id}`).set('Authorization', `Bearer ${tokenAdmin}`).send({ stage: 'paid' });
    expect(resPatch.status).toBe(200);
    const updated = resPatch.body;
    // commission should be computed as 5% of 10000 -> 500
    expect(Number(updated.commissionAmount)).toBe(500);
  });
});
