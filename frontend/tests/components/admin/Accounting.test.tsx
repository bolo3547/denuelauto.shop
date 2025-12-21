import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountingPage from '@/app/t/[tenantSlug]/admin/accounting/page';

// Mock next/navigation useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({ tenantSlug: 'sample-dealer' }),
}));

describe('Accounting Page', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const u = String(args[0]);
      if (u.includes('/admin/billing/summary')) {
        return Promise.resolve({ ok: true, json: async () => ({ balance: 12345, due: 100 }) } as Response);
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response);
    });
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('renders Accounting page and shows billing summary', async () => {
    render(<AccountingPage />);
    expect(await screen.findByText(/Accounting/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total Balance/i)).toBeInTheDocument();
  });

  it('shows summary cards for revenue and expenses', async () => {
    render(<AccountingPage />);
    expect(await screen.findByText(/Revenue/i)).toBeInTheDocument();
    expect(await screen.findByText(/Expenses/i)).toBeInTheDocument();
    expect(await screen.findByText(/Due Payments/i)).toBeInTheDocument();
  });

  it('has tabs for overview, transactions, and invoices', async () => {
    render(<AccountingPage />);
    await screen.findByText(/Total Balance/i);
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invoices/i })).toBeInTheDocument();
  });

  it('switches to transactions tab', async () => {
    render(<AccountingPage />);
    await screen.findByText(/Total Balance/i);
    const transactionsTab = screen.getByRole('button', { name: /transactions/i });
    fireEvent.click(transactionsTab);
    expect(await screen.findByText(/Reference/i)).toBeInTheDocument();
  });
});
