import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock auth-client to return a stable session
const mockUser = { id: 'u1', fullName: 'Admin', email: 'admin@tenant', type: 'tenant_user', role: 'dealer_admin', tenantSlug: 'sample-dealer', tenantName: 'Sample Dealer' };
jest.mock('@/lib/auth-client', () => ({
  getAuthSession: () => ({ token: 'test', user: mockUser, expiresAt: Date.now() + 3600000 }),
  clearAuthSession: jest.fn(),
}));

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/t/sample-dealer/admin',
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ tenantSlug: 'sample-dealer' }),
  useSearchParams: () => new URLSearchParams(),
}));

import TenantAdminLayout from '@/app/t/[tenantSlug]/admin/layout';

describe('Tenant Admin Layout', () => {
  it('shows HR and Accounting navigation items', async () => {
    render(<TenantAdminLayout><div>Child</div></TenantAdminLayout>);
    // Use findByRole or findAllByText since both HR and Accounting appear in navItems
    expect(await screen.findByText('HR')).toBeInTheDocument();
    expect(await screen.findByText('Accounting')).toBeInTheDocument();
  }, 30000);
});
