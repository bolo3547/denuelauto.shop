import request from 'supertest';
import app from '../../../src/app';

jest.mock('../../../src/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => { req.user = { id: 'u1', email: 'a@a', role: 'buyer', tenantId: 't1' }; return next(); }
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn().mockResolvedValue('https://signed.example') }));

const mockS3Send = jest.fn();
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
    PutObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn()
  };
});

jest.mock('../../../src/config/db', () => ({
  prisma: {
    proformainvoice: { findUnique: jest.fn() },
    paymentProof: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() }
  }
}));

describe('uploads routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/uploads/sign creates DB record and returns presigned url', async () => {
    const { prisma } = require('../../../src/config/db');
    prisma.proformainvoice.findUnique.mockResolvedValue({ id: 'inv1', tenantId: 't1' });
    prisma.paymentProof.create.mockResolvedValue({ id: 'pf1' });

    const res = await request(app).post('/api/uploads/sign').send({ invoiceId: 'inv1', filename: 'proof.png' });
    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBeDefined();
    expect(prisma.paymentProof.create).toHaveBeenCalled();
  });

  it('POST /api/uploads/confirm handles missing scanner (pending_scan)', async () => {
    const { prisma } = require('../../../src/config/db');
    prisma.paymentProof.findUnique.mockResolvedValue({ id: 'pf1', tenantId: 't1', fileUrl: 'https://s3/bucket/key' });

    // Make S3 head and get succeed but no clamscan available (spawnSync will throw in node env; we can simulate by mocking spawn)
    mockS3Send.mockImplementationOnce(async () => ({})); // Head
    mockS3Send.mockImplementationOnce(async () => ({ Body: { [Symbol.asyncIterator]: async function* () { yield Buffer.from('data'); } } })); // GetObject

    // Mock spawnSync to throw an error
    jest.spyOn(require('child_process'), 'spawnSync').mockImplementation(() => ({ error: new Error('not found') }));

    const res = await request(app).post('/api/uploads/confirm').send({ proofId: 'pf1' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/pending virus scan/);
    expect(prisma.paymentProof.update).toHaveBeenCalledWith({ where: { id: 'pf1' }, data: { status: 'pending_scan' } });
  });
});
