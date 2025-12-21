import React from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import { TenantHeaderInfo } from '@/components/public/useTenantHeader';

export default function PublicLayout({ children, tenantSlug, initialTenant }: { children: React.ReactNode; tenantSlug?: string; initialTenant?: TenantHeaderInfo }) {
  return (
    <div className="min-h-screen">
      {/* Replace primitive header with the dynamic tenant header */}
      <Header tenantSlug={tenantSlug ?? 'denuel-auto'} initialTenant={initialTenant} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-xs text-gray-500 mx-auto max-w-6xl px-4">
        © {new Date().getFullYear()} Denuel Auto
      </footer>
    </div>
  );
}
