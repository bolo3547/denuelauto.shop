// Ensure Request global is defined for next/server to use
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require('node-fetch');
// @ts-ignore
global.Request = nodeFetch.Request;
// @ts-ignore
global.Response = nodeFetch.Response;
// @ts-ignore
global.Headers = nodeFetch.Headers;

// Mock prisma used in the route - mock BEFORE importing the route module
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    temporaryRegistration: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenantSubscription: {
      create: jest.fn(),
    },
    user: { create: jest.fn() },
    branch: { create: jest.fn() },
    auditLog: {
      create: jest.fn(),
    }
  }
}));

jest.mock('../../../../src/utils/notifications', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }));

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('HASHED') }));

describe.skip('moved frontend approve route tests to backend', () => {
  it('placeholder - moved to backend', () => {
    expect(true).toBe(true);
  });
});
