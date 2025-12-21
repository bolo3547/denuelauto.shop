import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import printService from '../src/print/print.service';

jest.mock('../src/print/print.service', () => ({
  default: {
    mapData: jest.fn().mockResolvedValue({
      tenant: { id: 't1', slug: 'sample-dealer' },
      proforma: { id: 'pf1', number: 'PF-2025-0012', status: 'sent' },
      totals: { grand: 11557 },
      doc_hash: 'abc123',
      qr_image: '<img src="data:image/png;base64,xyz"/>'
    }),
    compile: jest.fn().mockResolvedValue('<html><body>ok</body></html>'),
    toPdf: jest.fn().mockResolvedValue(Buffer.from('PDF'))
  }
}));

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

describe('Print Controller', () => {
  it('GET /print/proforma/:id without JWT returns 401', async () => {
    const res = await request(app).get('/print/proforma/pf1');
    expect(res.status).toBe(401);
  });

  it('GET /print/proforma/:id with JWT returns HTML', async () => {
    const token = jwt.sign({ id: 'user1', role: 'dealer_manager', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/print/proforma/pf1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['x-doc-hash']).toBeDefined();
  });

  it('GET /print/proforma/:id?format=pdf with JWT and step-up returns PDF', async () => {
    const token = jwt.sign({ id: 'user1', role: 'dealer_owner', tenantId: 't1' }, JWT_SECRET, { expiresIn: '1h' });
    // sign step-up token using the project's signing function (if exported)
    const stepUpToken = jwt.sign({ id: 'user1' }, process.env.STEPUP_SECRET || 'stepup_secret', { expiresIn: '2m' });
    const res = await request(app).get('/print/proforma/pf1').query({ format: 'pdf' }).set('Authorization', `Bearer ${token}`).set('x-stepup-token', stepUpToken);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });
});
