'use client';

import React from 'react';
import Header from './Header';
import TenantThemeProvider from '../TenantThemeProvider';

export default function PublicLayout({ tenantSlug, children }: { tenantSlug?: string; children: React.ReactNode }) {
  return (
    <TenantThemeProvider tenantSlug={tenantSlug ?? 'denuel-auto'}>
      <div className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
        <Header tenantSlug={tenantSlug ?? 'denuel-auto'} />
        <main id="main">{children}</main>
      </div>
    </TenantThemeProvider>
  );
}
