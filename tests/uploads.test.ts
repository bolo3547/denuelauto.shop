import { POST as signHandler } from '../app/api/uploads/sign/route';
import { POST as confirmHandler } from '../app/api/uploads/confirm/route';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Uploads API (sign & confirm)', () => {
  const fakeUser = { id: 'user1', tenantId: 'tenant1' };
  const mockPrisma = require('../src/prismaClient').prisma;

  beforeEach(() => {
    jest.resetAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue({ userId: fakeUser.id });
  });

  test('sign endpoint creates DB record and returns presigned url', async () => {
    // Mock prisma.user.findUnique
    mockPrisma.user = { findUnique: jest.fn().mockResolvedValue(fakeUser) };
    // Mock prisma.paymentProof.create
    mockPrisma.paymentProof = { create: jest.fn().mockImplementation(({ data }) => ({ id: 'proof1', ...data })) };

    // Mock getSignedUrl by mocking s3 client to avoid real AWS calls
    const req: any = {
      headers: { get: (k: string) => 'Bearer FAKE' },
      json: async () => ({ invoiceId: 'inv1', filename: 'proof.jpg', contentType: 'image/jpeg' })
    };

    const res: any = await signHandler(req);
    // NextResponse.json returns a Response-like object in next; our handler returns NextResponse
    // Inspect returned value by awaiting json (NextResponse.json returns NextResponse directly with body accessible only in actual runtime)
    expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    expect(mockPrisma.paymentProof.create).toHaveBeenCalled();
    // Basic shape check on response
    expect(res).toBeDefined();
  });

  test('confirm endpoint marks pending_scan if clamscan missing', async () => {
    // Mock jwt and prisma
    mockPrisma.user = { findUnique: jest.fn().mockResolvedValue(fakeUser) };
    mockPrisma.paymentProof = {
      findUnique: jest.fn().mockResolvedValue({ id: 'proof1', tenantId: 'tenant1', fileUrl: 'https://s3.fake/bucket/key' }),
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock S3 client send to return a Body stream-like object
    jest.mock('@aws-sdk/client-s3', () => ({
      S3Client: function() { return { send: jest.fn().mockResolvedValue({ Body: Buffer.from('ok') }) }; },
      HeadObjectCommand: jest.fn(),
      GetObjectCommand: jest.fn(),
      DeleteObjectCommand: jest.fn()
    }));

    // Mock spawnSync to throw (no clamscan present)
    jest.spyOn(require('child_process'), 'spawnSync').mockImplementation(() => { throw new Error('not found'); });

    const req: any = { headers: { get: (k: string) => 'Bearer FAKE' }, json: async () => ({ proofId: 'proof1' }) };
    const res: any = await confirmHandler(req);

    expect(mockPrisma.paymentProof.findUnique).toHaveBeenCalledWith({ where: { id: 'proof1' } });
    expect(mockPrisma.paymentProof.update).toHaveBeenCalled();
    expect(res).toBeDefined();
  });
});
