import React from 'react';
import { render, screen, within } from '@testing-library/react';
import TenantAdminDashboard from '@/app/t/[tenantSlug]/admin/page';

// Mock next/navigation useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({ tenantSlug: 'sample-dealer' }),
}));

describe('TenantAdminDashboard', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    // set localStorage session
    const session = {
      token: 'testing-token',
      user: { tenantName: 'Sample Dealer', tenantSlug: 'sample-dealer' },
      expiresAt: Date.now() + 1000 * 60 * 60,
    };
    localStorage.setItem('denuel_auth_session', JSON.stringify(session));

    // Mock fetch to return dashboard stats
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const u = String(args[0]);
      if (typeof u === 'string' && u.includes('/admin/stats')) {
        return Promise.resolve({ ok: true, json: async () => ({ stats: {
          totalCars: 10,
          carsChange: 5,
          totalSales: 3,
          salesChange: 1,
          totalCustomers: 4,
          customersChange: 2,
          monthlyRevenue: 50000,
          revenueChange: 10,
        }, recentOrders: [
          { id: 'o1', customerName: 'John Test', carName: '2020 Test Car', amount: 2000, status: 'pending', date: new Date().toISOString() }
        ] }) } as Response);
      }
      // default fallback
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response);
    }) as jest.Mock;
  });

  afterEach(() => {
    localStorage.removeItem('denuel_auth_session');
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('fetches dashboard stats and displays them', async () => {
    render(<TenantAdminDashboard />);

    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
    const invLabel = await screen.findByText(/Total Inventory/i);
    expect(invLabel).toBeInTheDocument();
    const invCard = invLabel.closest('div');
    expect(invCard).not.toBeNull();
    expect(within(invCard as HTMLElement).getByText(/^10$/)).toBeInTheDocument();
    expect(await screen.findByText(/John Test/i)).toBeInTheDocument();
  });
});
