import request from 'supertest';
import app from '../../../src/app';

jest.mock('../../../src/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => { req.user = { id: 'admin1', email: 'a@a', role: 'dealer_owner', tenantId: 't1' }; return next(); }
}));

jest.mock('../../../src/services/paymentProofs.service', () => ({
  approvePaymentProof: jest.fn().mockResolvedValue({ ok: true }),
  rejectPaymentProof: jest.fn().mockResolvedValue({ ok: true })
}));

jest.mock('../../../src/middleware/permissions', () => ({
  requirePermission: (_: any) => (req: any, res: any, next: any) => next()
}));

describe('payment proofs routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('approves a proof', async () => {
    const res = await request(app).patch('/api/payment-proofs/abc/approve').send();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it('rejects a proof with reason', async () => {
    const res = await request(app).patch('/api/payment-proofs/abc/reject').send({ reason: 'Bad file' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });
});
