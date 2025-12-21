"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { TenantTheme } from '../../types/tenant';
import QuickAddCarModal from '../QuickAddCarModal';

export default function DealerLayout({ tenantTheme, children }: { tenantTheme: TenantTheme; children: React.ReactNode }) {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top info bar */}
      <div className="bg-white border-b text-sm text-gray-700">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="text-xs">{tenantTheme?.location ?? ''}</div>
          <div className="flex items-center gap-4">
            {tenantTheme?.phone && <a href={`tel:${tenantTheme.phone}`} className="hover:underline">{tenantTheme.phone}</a>}
            {tenantTheme?.whatsapp && <a className="hover:underline" href={`https://wa.me/${tenantTheme.whatsapp.replace(/\+|\s/g,'')}`}>Chat on WhatsApp</a>}
            {tenantTheme?.email && <a href={`mailto:${tenantTheme.email}`} className="hover:underline">{tenantTheme.email}</a>}
          </div>
        </div>
      </div>

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
                {tenantTheme?.logoUrl ? <img src={tenantTheme.logoUrl} alt={tenantTheme.name ?? 'logo'} className="h-10"/> : <div className="text-lg font-bold">{tenantTheme?.name ?? ''}</div>}
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 items-center text-sm">
            <Link href="/dealer-template" className="hover:underline">Home</Link>
            <Link href="/dealer-template/stock" className="hover:underline">Stock List</Link>
            <Link href="/dealer-template/how-to-buy" className="hover:underline">How to Buy</Link>
            <Link href="/dealer-template#about" className="hover:underline">Why Choose Us</Link>
            <Link href="/dealer-template/contact" className="hover:underline">Contact</Link>
            <Link href="/dealer-template/trust" className="hover:underline">Trust</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={()=>setQuickOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium border border-gray-200 bg-white text-slate-800 hover:shadow-md focus:outline-none focus-visible:ring-2" aria-label="Admin quick add cars">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quick Add
            </button>
            <Link href="/dealer-template/contact" className="px-3 py-2 rounded text-sm border border-gray-200">Contact</Link>
            <Link href="/dealer-template/stock" className="px-3 py-2 rounded bg-[var(--accent)] text-white" style={{background: tenantTheme.accentColor}}>
              Browse stock
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      {/* Footer removed: use DealerFooter component instead */}
      <QuickAddCarModal open={quickOpen} onClose={()=>setQuickOpen(false)} />
    </div>
  );
}
