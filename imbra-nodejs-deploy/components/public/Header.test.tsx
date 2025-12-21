import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
// Avoid third-party userEvent in case not available in test deps; use fireEvent instead
import Header from './Header';

// Mock next/navigation useRouter to capture pushes
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/t/denuel-auto/stock',
}));

// This is a simple skeleton - wiring API mocks and more detailed expectations are left as TODOs.

describe('Header', () => {
  it('renders header with logo and search bar', () => {
    render(<Header tenantSlug="denuel-auto" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // the SearchBar uses role=search
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('opens and closes mobile menu', () => {
    render(<Header tenantSlug="denuel-auto" />);
    const openBtn = screen.getByLabelText(/open mobile menu/i);
    fireEvent.click(openBtn);
    expect(openBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(/close mobile menu/i)).toBeInTheDocument();
    const closeBtn = screen.getByLabelText(/close mobile menu/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByLabelText(/close mobile menu/i)).not.toBeInTheDocument();
  });

  it('opens suggestions when typing in search', async () => {
    // Mock the autocomplete API response
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('/header-autocomplete')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ type: 'make', id: 1, label: 'Toyota', meta: { stockCount: 12 } }]) } as any);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as any);
    }) as unknown as jest.Mock;

    render(<Header tenantSlug="denuel-auto" />);
    const input = screen.getByLabelText('Search inventory');
    // Simulate typing by updating value and sending input events
    fireEvent.change(input, { target: { value: 'toyota' } });
    // debounce 250ms - give time for suggestions to show
    await new Promise((r) => setTimeout(r, 350));
    // listbox should now be present
    const list = screen.getByRole('listbox');
    expect(list).toBeInTheDocument();
    // suggestion should be present
    expect(screen.getByText('Toyota')).toBeInTheDocument();
  });

  it('navigates when selecting suggestion via keyboard', async () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({ push }));

    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('/header-autocomplete')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([
          { type: 'make', id: 1, label: 'Toyota', meta: { stockCount: 12 } },
          { type: 'model', id: 2, label: 'Toyota RAV4', meta: { stockCount: 3 } },
        ]) } as any);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as any);
    }) as unknown as jest.Mock;

    render(<Header tenantSlug="denuel-auto" />);
    const input = screen.getByLabelText('Search inventory');
    fireEvent.change(input, { target: { value: 'toyota' } });
    await new Promise((r) => setTimeout(r, 350));

    // Press ArrowDown twice to highlight second suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should have called push with query for highlighted suggestion
    expect(push).toHaveBeenCalled();
  });

  it('closes mobile menu with escape key and toggles aria-expanded', () => {
    render(<Header tenantSlug="denuel-auto" />);
    const openBtn = screen.getByLabelText(/open mobile menu/i);
    fireEvent.click(openBtn);
    expect(openBtn).toHaveAttribute('aria-expanded', 'true');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // simulate Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(openBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
