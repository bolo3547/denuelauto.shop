import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children, tenantSlug }: { children: React.ReactNode; tenantSlug: string }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link href={`/t/${tenantSlug}/admin`} className="font-bold text-[var(--color-primary)]">Admin</Link>
          <nav className="flex gap-4 text-sm">
            <Link href={`/t/${tenantSlug}/admin/inventory`}>Inventory</Link>
            <Link href={`/t/${tenantSlug}/admin/leads`}>Leads</Link>
            <Link href={`/t/${tenantSlug}/admin/finance/payment-proofs`}>Finance</Link>
            <Link href={`/t/${tenantSlug}/admin/theme`}>Theme</Link>
            <Link href={`/t/${tenantSlug}/admin/staff`}>Staff</Link>
            <Link href={`/t/${tenantSlug}/admin/cashier`}>POS</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
