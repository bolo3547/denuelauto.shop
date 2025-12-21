import React from 'react';
import { render, screen } from '@testing-library/react';
import HqLayout from '@/app/hq/layout';
import { HqAdminProvider, useHqAdminContext } from '@/contexts/HqAdminContext';

let fetchSpy: jest.SpyInstance;
beforeEach(() => {
  if (!('fetch' in globalThis)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = jest.fn();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
    const u = String(args[0]);
    if (typeof u === 'string' && u.includes('/api/hq/auth/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ admin: { id: 'a1', email: 'admin@hq', role: 'SUPER_ADMIN' } }) } as Response);
    }
    if (typeof u === 'string' && u.includes('/registration/pending')) {
      const items = [
        { id: 'r1', businessName: 'ACME', email: 'a@example.com', phone: '1', createdAt: new Date().toISOString() },
        { id: 'r2', businessName: 'Beta', email: 'b@example.com', phone: '2', createdAt: new Date().toISOString() },
      ];
      return Promise.resolve({ ok: true, json: async () => ({ items }) } as Response);
    }
    return Promise.resolve({ ok: false, json: async () => ({}) } as Response);
  }) as jest.Mock;
});

afterEach(() => {
  fetchSpy.mockRestore();
  jest.restoreAllMocks();
});

function SetAdmin() {
  const { setAdmin } = useHqAdminContext();
  React.useLayoutEffect(() => {
    setAdmin({ id: 'a1', email: 'admin@hq', role: 'SUPER_ADMIN' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <HqAdminProvider>
      <SetAdmin />
      {children}
    </HqAdminProvider>
  );
}

describe('HqLayout', () => {
  it('shows Registrations link for HQ admin with pending count', async () => {
    render(<HqLayout><div>Children</div></HqLayout>, { wrapper: Wrapper as any });
    expect(await screen.findByText(/Registrations/i)).toBeInTheDocument();
    expect(await screen.findByText(/2/)).toBeInTheDocument();
  });
});
