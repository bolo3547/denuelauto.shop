import { provisionTenant } from '../hqProvision.service';

jest.mock('../../utils/notifications', () => ({ sendEmail: jest.fn() }));

const mockTx: any = {
  tenant: { findUnique: jest.fn(), create: jest.fn() },
  tenantsubscription: { create: jest.fn() },
  user: { create: jest.fn() },
  branch: { create: jest.fn() },
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $transaction: async (cb: any) => cb(mockTx),
    })),
  };
});

describe('hqProvision.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates tenant, subscription, user, branch and sends email', async () => {
    // Arrange
    mockTx.tenant.findUnique.mockResolvedValueOnce(null);
    mockTx.tenant.create.mockResolvedValueOnce({ id: 't1', slug: 'tenant-1', name: 'My Tenant' });
    mockTx.tenantsubscription.create.mockResolvedValueOnce({ id: 's1' });
    mockTx.user.create.mockResolvedValueOnce({ id: 'u1', email: 'admin@example.com' });
    mockTx.branch.create.mockResolvedValueOnce({ id: 'b1' });

    // Act
    const result = await provisionTenant({ businessName: 'My Tenant', contactName: 'Admin', contactEmail: 'admin@example.com' });

    // Assert
    expect(result.tenant).toBeDefined();
    expect(result.adminUser).toBeDefined();
  });
});
