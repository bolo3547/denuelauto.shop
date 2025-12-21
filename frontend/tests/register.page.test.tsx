import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../app/register/tenant/page';
import '@testing-library/jest-dom';

// mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('Register page', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation((...args: unknown[]) => {
      const url = String(args[0]);
      if (url.endsWith('/api/auth/otp/send')) return Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as any);
      if (url.endsWith('/api/auth/otp/verify')) return Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as any);
      if (url.endsWith('/api/auth/register')) return Promise.resolve({ ok: true, json: async () => ({ token: 't' }) } as any);
      return Promise.resolve({ ok: true } as any);
    });
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
  });
  it('completes first step of onboarding and proceeds to next', async () => {
    render(<Register />);
    const nameInput = screen.getByPlaceholderText('Business name');
    const countrySelect = screen.getByPlaceholderText('Country');
    const cityInput = screen.getByPlaceholderText('City / Port');
    const phoneInput = screen.getByPlaceholderText('Primary contact phone');
    const emailInput = screen.getByPlaceholderText('Primary contact email');

    fireEvent.change(nameInput, { target: { value: 'Test Dealer' } });
    fireEvent.change(countrySelect, { target: { value: 'Zambia' } });
    fireEvent.change(cityInput, { target: { value: 'Lusaka' } });
    fireEvent.change(phoneInput, { target: { value: '+260971234567' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const nextBtn = screen.getByRole('button', { name: /save & continue/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);

    await waitFor(() => { expect(screen.getByText(/Operational Profile/i)).toBeInTheDocument(); });
  });
});
