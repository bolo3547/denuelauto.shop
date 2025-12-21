import { getAdminOrders, getAdminCustomers } from '@/lib/adminClient';

describe('adminClient helpers', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const url = String(args[0]);
      if (url.includes('/admin/orders')) {
        return Promise.resolve({ ok: true, json: async () => ([{ id: 'o1', customerName: 'John' }]) } as Response);
      }
      if (url.includes('/admin/buyers') || url.includes('/admin/customers')) {
        return Promise.resolve({ ok: true, json: async () => ([{ id: 'c1', name: 'Alice' }]) } as Response);
      }
      if (url.includes('/admin/employees')) {
        return Promise.resolve({ ok: true, json: async () => ([{ id: 'e1', name: 'Alice', email: 'alice@example.com', role: 'HR Manager' }]) } as Response);
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response);
    });
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('getAdminOrders returns an array of orders', async () => {
    const orders = await getAdminOrders('sample-dealer');
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders[0]).toHaveProperty('id', 'o1');
  });

  it('getAdminCustomers returns an array of customers', async () => {
    const customers = await getAdminCustomers('sample-dealer');
    expect(Array.isArray(customers)).toBeTruthy();
    expect(customers[0]).toHaveProperty('id', 'c1');
  });
});
