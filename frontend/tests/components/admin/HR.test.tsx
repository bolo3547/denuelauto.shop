import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import HrPage from '@/app/t/[tenantSlug]/admin/hr/page';

// Mock next/navigation useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({ tenantSlug: 'sample-dealer' }),
}));

describe('HR Page', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const u = String(args[0]);
      if (u.includes('/admin/employees')) {
        return Promise.resolve({ ok: true, json: async () => ([{ id: 'e1', name: 'Alice', email: 'alice@example.com', role: 'Sales Rep', department: 'Sales', status: 'active' }]) } as Response);
      }
      return Promise.resolve({ ok: false, json: async () => ({}) } as Response);
    });
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('renders HR Portal and lists employees', async () => {
    render(<HrPage />);
    expect(await screen.findByText(/HR Portal/i)).toBeInTheDocument();
    const table = await screen.findByRole('table');
    const row = within(table).getByText('Alice').closest('tr');
    expect(row).toBeTruthy();
    expect(within(row as HTMLElement).getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows Add Employee button', async () => {
    render(<HrPage />);
    expect(await screen.findByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('opens modal when Add Employee is clicked', async () => {
    render(<HrPage />);
    const addButton = await screen.findByRole('button', { name: /add employee/i });
    fireEvent.click(addButton);
    expect(await screen.findByText(/Add New Employee/i)).toBeInTheDocument();
  });

  it('shows edit and delete buttons for employees', async () => {
    render(<HrPage />);
    await screen.findByText('Alice');
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });
});
