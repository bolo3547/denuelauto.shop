import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HqRegistrationPendingPage from '@/app/hq/registration/pending/page';
import { HqAdminProvider, useHqAdminContext } from '@/contexts/HqAdminContext';

describe('HqRegistrationPendingPage', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const u = String(args[0]);
      if (typeof u === 'string' && u.includes('/registration/pending')) {
        const items = [
          {
            id: 'r1',
            businessName: 'ACME Motors',
            email: 'hello@acme.example',
            phone: '+441234567',
            paymentProofUrl: 'https://example.com/proof.jpg',
            createdAt: new Date().toISOString(),
          },
        ];
        return Promise.resolve({ ok: true, json: async () => ({ items }) } as Response);
      }
      if (typeof u === 'string' && u.includes('/registration/r1/approve')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as Response);
      }
      if (typeof u === 'string' && u.includes('/registration/r1/reject')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as Response);
      }
      if (typeof u === 'string' && u.includes('/api/hq/auth/me')) {
        return Promise.resolve({ ok: true, json: async () => ({ admin: { id: 'a1', email: 'admin@hq', role: 'SUPER_ADMIN' } }) } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({})
      } as Response);
    }) as jest.Mock;
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <HqAdminProvider>
        <SetAdmin />
        {children}
      </HqAdminProvider>
    );
  }

  function SetAdmin() {
    const { setAdmin } = useHqAdminContext();
    React.useEffect(() => {
      setAdmin({ id: 'a1', email: 'admin@hq', role: 'SUPER_ADMIN' });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  }

  it('renders pending items and approves item', async () => {
    render(<HqRegistrationPendingPage />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> });
    // wait until pending items are loaded
    expect(await screen.findByText(/hello@acme.example/i)).toBeInTheDocument();
    expect(screen.getByText(/acme motors/i)).toBeInTheDocument();

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => expect(screen.queryByText(/acme motors/i)).not.toBeInTheDocument());
  });

  it('rejects a pending registration and removes it from the list', async () => {
    render(<HqRegistrationPendingPage />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> });
    // wait for the item
    expect(await screen.findByText(/acme motors/i)).toBeInTheDocument();
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);
    await waitFor(() => expect(screen.queryByText(/acme motors/i)).not.toBeInTheDocument());
  });

  it('shows details modal when clicking Details and displays payment proof link', async () => {
    render(<HqRegistrationPendingPage />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> });
    // wait for the item
    expect(await screen.findByText(/acme motors/i)).toBeInTheDocument();
    const detailsButton = screen.getByRole('button', { name: /details/i });
    fireEvent.click(detailsButton);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/payment proof/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute('href', 'https://example.com/proof.jpg');
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });
});
