import request from 'supertest';
import app from '../../../src/app';

jest.mock('../../../src/services/hqProvision.service', () => ({
  provisionTenant: jest.fn().mockResolvedValue({ tenant: { id: 't1', slug: 'acme', name: 'ACME' }, adminUser: { id: 'u1', email: 'owner@acme.com' } })
}));

// Mock HQ auth middleware to bypass auth in tests
jest.mock('../../../src/middleware/hqAuth', () => ({
  requireHqAdminAuth: (req: any, res: any, next: any) => next(),
  requireHqRole: (roles: any) => (req: any, res: any, next: any) => next()
}));

describe('POST /api/hq/tenants/provision', () => {
  it('provisions a tenant when called by HQ admin', async () => {
    const res = await request(app).post('/api/hq/tenants/provision').send({ businessName: 'ACME', contactEmail: 'owner@acme.com' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ok: true, tenant: { slug: 'acme' }, user: { email: 'owner@acme.com' } });
  });
});
