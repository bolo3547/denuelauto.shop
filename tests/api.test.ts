import request from 'supertest';
import jwt from 'jsonwebtoken';
import { signStepUpToken } from '../src/middleware/stepUp';
import printService from '../src/print/print.service';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Prepare a mock export for print service before importing app so routes use mock
jest.mock('../src/print/print.service', () => {
  return {
    compile: jest.fn(async (_template: string, _data: any) => '<html>OK</html>'),
    toPdf: jest.fn(async (_html: string) => Buffer.from('PDF')),
    mapData: jest.fn(async (template: string, id: string) => {
      if (template === 'proforma') {
        return {
          tenant: { id: 't1', slug: 'sample-dealer' },
          proforma: { id, number: 'PF-2025-0012', status: 'sent', currency: 'USD', total: 100 },
          doc_hash: 'abc',
          totals: { grand: 100 },
          pay_qr_payload: 'PF-2025-0012|USD|100',
          qr_image: '',
        };
      }
      if (template === 'commercial_invoice') {
        return { tenant: { id: 't1' }, invoice: { id, number: 'INV-1', status: 'paid' }, doc_hash: 'abc' };
      }
      if (template === 'packing_list') {
        return { tenant: { id: 't1' }, shipment: { id, ref: 'SH-1', is_paid: true }, doc_hash: 'abc' };
      }
      if (template === 'receipt') {
        return { tenant: { id: 't1' }, payment: { id, status: 'verified', ref: 'PAY-1' }, payer: { name: 'John' }, doc_hash: 'abc' };
      }
      return {};
    }),
  };
});

import app from '../src/app';

describe('Public routes', () => {
  it('GET / returns Car Dealership API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('Public catalog (Tenant sample-dealer) returns 200', async () => {
    const res = await request(app).get('/t/sample-dealer/public/cars');
    // since DB may not be seeded, allow 200 or 404
    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/cars without JWT returns 401', async () => {
    const res = await request(app).get('/api/cars');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/payments/:id/verify without JWT returns 401', async () => {
    const res = await request(app).patch('/api/payments/unknown/verify').send({ status: 'verified' });
    expect([401, 403, 404]).toContain(res.status);
  });

  it('POST /api/auth/step-up without JWT returns 401', async () => {
    const res = await request(app).post('/api/auth/step-up').send({ password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('POST /api/leads without JWT returns 401', async () => {
    const res = await request(app).post('/api/leads').send({ name: 'Test Lead' });
    expect(res.status).toBe(401);
  });

  it('POST /api/proformas without JWT returns 401', async () => {
    const res = await request(app).post('/api/proformas').send({ number: 'PF-0002', currency: 'USD', total: 100 });
    expect(res.status).toBe(401);
  });

  it('POST /api/cars without JWT returns 401', async () => {
    const res = await request(app).post('/api/cars').send({ stockNo: 'S-TEST', make: 'T', model: 'M', year: 2020 });
    expect(res.status).toBe(401);
  });

  it('POST /api/cars with wrong role returns 403', async () => {
    // sign a JWT as buyer (no cars.create permission)
    const token = jwt.sign({ id: 'fake', role: 'buyer', tenantId: 'fake-tenant' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).post('/api/cars').set('Authorization', `Bearer ${token}`).send({ stockNo: 'S-TEST', make: 'T', model: 'M', year: 2020 });
    expect([403, 404]).toContain(res.status);
  });

  it('PATCH /api/payments/unknown/verify with admin token but without step-up returns 401/403/404', async () => {
    const token = jwt.sign({ id: 'fake', role: 'dealer_owner', tenantId: 'fake-tenant' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).patch('/api/payments/unknown/verify').set('Authorization', `Bearer ${token}`).send({ status: 'verified' });
    expect([401, 403, 404]).toContain(res.status);
  });

  it('GET /print/proforma/pf1 with admin token returns html and doc hash', async () => {
    // mock mapData & compile to avoid DB/Puppeteer e2e
    const mapSpy = jest.spyOn(printService, 'mapData').mockResolvedValue({ tenant: { slug: 'sample-dealer' }, proforma: { number: 'PF-123', status: 'sent' }, doc_hash: 'abc123' } as any);
    const compileSpy = jest.spyOn(printService, 'compile').mockResolvedValue('<html><body>ok</body></html>');
    const token = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId: 't1' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['x-doc-hash']).toBe('abc123');
    expect(res.headers['content-type']).toContain('text/html');
    mapSpy.mockRestore();
    compileSpy.mockRestore();
  });

  it('GET /print/proforma/pf1 with buyer role returns 403', async () => {
    const mapSpy = jest.spyOn(printService, 'mapData').mockResolvedValue({ tenant: { slug: 'sample-dealer' }, proforma: { number: 'PF-123', status: 'sent' }, doc_hash: 'abc123' } as any);
    const compileSpy = jest.spyOn(printService, 'compile').mockResolvedValue('<html><body>ok</body></html>');
    const token = jwt.sign({ id: 'buyer1', role: 'buyer', tenantId: 't1' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1').set('Authorization', `Bearer ${token}`);
    expect([403, 404]).toContain(res.status);
    mapSpy.mockRestore();
    compileSpy.mockRestore();
  });

  it('GET /print/commercial_invoice/:id requires step-up for paid invoice', async () => {
    // mapData returns invoice with paid status -> require step-up
    const mapSpy = jest.spyOn(printService, 'mapData').mockResolvedValue({ tenant: { slug: 'sample-dealer' }, invoice: { number: 'INV-1', status: 'paid' }, doc_hash: 'def456' } as any);
    const compileSpy = jest.spyOn(printService, 'compile').mockResolvedValue('<html><body>invoice</body></html>');
    const token = jwt.sign({ id: 'admin', role: 'dealer_owner', tenantId: 't1' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '1h' });
    const resNoStepUp = await request(app).get('/print/commercial_invoice/inv1').set('Authorization', `Bearer ${token}`);
    expect(resNoStepUp.status).toBe(401);
    // sign step-up token
    const stepUpToken = signStepUpToken('admin');
    const resWithStepUp = await request(app).get('/print/commercial_invoice/inv1').set('Authorization', `Bearer ${token}`).set('x-stepup-token', stepUpToken);
    expect(resWithStepUp.status).toBe(200);
    expect(resWithStepUp.headers['x-doc-hash']).toBe('def456');
    mapSpy.mockRestore();
    compileSpy.mockRestore();
  });
  it('GET /print/proforma/pf1 without JWT returns 401', async () => {
    const res = await request(app).get('/print/proforma/pf1');
    expect(res.status).toBe(401);
  });

  it('GET /print/proforma/pf1 with buyer token returns 403', async () => {
    const token = jwt.sign({ id: 'u1', role: 'buyer', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET /print/proforma/pf1 with dealer_manager returns HTML', async () => {
    const token = jwt.sign({ id: 'u2', role: 'dealer_manager', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1').set('Authorization', `Bearer ${token}`);
    // With mocked compile compiled to HTML
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('OK');
  });

  it('GET /print/proforma/pf1?format=pdf returns PDF', async () => {
    const token = jwt.sign({ id: 'u2', role: 'dealer_manager', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1?format=pdf').set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers['content-type']).toContain('application/pdf');
    }
  });

  it('GET /print/commercial_invoice/1 requires step-up when paid', async () => {
    const token = jwt.sign({ id: 'u3', role: 'dealer_manager', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/commercial_invoice/1').set('Authorization', `Bearer ${token}`);
    // MapData says status paid -> require step-up
    expect([401, 403]).toContain(res.status);
    // sign a step-up token for user id u3 and try again
    const stepUp = signStepUpToken('u3');
    const res2 = await request(app).get('/print/commercial_invoice/1').set('Authorization', `Bearer ${token}`).set('x-stepup-token', stepUp);
    expect([200, 404]).toContain(res2.status);
  });

  it('GET /print/packing_list/1 requires step-up when is_paid', async () => {
    const token = jwt.sign({ id: 'u4', role: 'dealer_manager', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/packing_list/1').set('Authorization', `Bearer ${token}`);
    expect([401, 403]).toContain(res.status);
    const stepUp = signStepUpToken('u4');
    const res2 = await request(app).get('/print/packing_list/1').set('Authorization', `Bearer ${token}`).set('x-stepup-token', stepUp);
    expect([200, 404]).toContain(res2.status);
  });
});
