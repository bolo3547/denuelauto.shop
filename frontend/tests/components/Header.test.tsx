import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Header from '@/components/public/Header';

// Mock next/navigation useRouter to capture pushes
let pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
}));

describe('Header', () => {
  it('renders header with logo and search bar', () => {
    render(<Header tenantSlug="denuel-auto" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // the SearchBar uses role=search
    expect(screen.getByRole('search')).toBeInTheDocument();
    // Should have a visible logo (alt text contains tenant name or Denuel Auto)
    expect(screen.getByAltText(/Denuel Auto|DENUEL AUTO|Denuel/i)).toBeInTheDocument();
  });

  it('opens and closes mobile menu', () => {
    render(<Header tenantSlug="denuel-auto" />);
    const openBtn = screen.getByLabelText(/open mobile menu/i);
    fireEvent.click(openBtn);
    expect(screen.getByLabelText(/close mobile menu/i)).toBeInTheDocument();
    const closeBtn = screen.getByLabelText(/close mobile menu/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByLabelText(/close mobile menu/i)).not.toBeInTheDocument();
  });

  it('opens suggestions when typing in search', async () => {
    // Mock the autocomplete API response
    const makeResponse = <T,>(data: T) => ({ ok: true, json: async () => data } as unknown as Response);
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const url = String(args[0]);
      if (typeof url === 'string' && url.includes('/header-autocomplete')) {
        return Promise.resolve(makeResponse([{ type: 'make', id: 1, label: 'Toyota', meta: { stockCount: 12 } }]));
      }
      return Promise.resolve(makeResponse({}));
    }) as unknown as jest.Mock;

    // Provide initialTenant to avoid useTenantHeader fetch during mount
    const initialTenant = {
      name: 'DENUEL AUTO',
      tenantSlug: 'denuel-auto',
      logoUrl: '/api/placeholder/140/40',
      theme: { primary: '#000', accent: '#ff7a00', surface: '#fff', text: '#0f172a' },
      supportPhone: '+441234567890',
      availableCountries: ['US', 'UK'],
      defaultCountry: 'US',
      currencies: ['USD', 'GBP'],
    };

    render(<Header tenantSlug="denuel-auto" initialTenant={initialTenant} />);
    const input = screen.getByRole('combobox', { name: 'Search inventory' });
    fireEvent.change(input, { target: { value: 'toyota' } });
    // wait for listbox to appear (waitFor wraps with act)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    // suggestion should be present
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    fetchSpy.mockRestore();
  });

  it('navigates when selecting suggestion via keyboard', async () => {
    pushMock = jest.fn();

    const makeResponse2 = <T,>(data: T) => ({ ok: true, json: async () => data } as unknown as Response);
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchSpy2 = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const url = String(args[0]);
      if (typeof url === 'string' && url.includes('/header-autocomplete')) {
        return Promise.resolve(makeResponse2([
          { type: 'make', id: 1, label: 'Toyota', meta: { stockCount: 12 } },
          { type: 'model', id: 2, label: 'Toyota RAV4', meta: { stockCount: 3 } },
        ]));
      }
      return Promise.resolve(makeResponse2({}));
    }) as unknown as jest.Mock;

    const initialTenant = {
      name: 'DENUEL AUTO',
      tenantSlug: 'denuel-auto',
      logoUrl: '/api/placeholder/140/40',
      theme: { primary: '#000', accent: '#ff7a00', surface: '#fff', text: '#0f172a' },
      supportPhone: '+441234567890',
      availableCountries: ['US', 'UK'],
      defaultCountry: 'US',
      currencies: ['USD', 'GBP'],
    };
    render(<Header tenantSlug="denuel-auto" initialTenant={initialTenant} />);
    const input = screen.getByRole('combobox', { name: 'Search inventory' });
    fireEvent.change(input, { target: { value: 'toyota' } });
    await waitFor(() => expect(screen.getByText('Toyota')).toBeInTheDocument());

    // Press ArrowDown twice to highlight second suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should have called push with query for highlighted suggestion
    expect(pushMock).toHaveBeenCalled();
    fetchSpy2.mockRestore();
  });
});
