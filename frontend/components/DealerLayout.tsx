import React from 'react';
import Link from 'next/link';
import { TenantTheme } from '../types/dealer';

interface DealerLayoutProps {
  tenantTheme?: TenantTheme | null;
  children: React.ReactNode;
  currentPage?: string;
}

export default function DealerLayout({ tenantTheme, children, currentPage }: DealerLayoutProps) {
  const tone = (tenantTheme?.brandTone || 'professional') as string;
  const toneClass = tone === 'formal' ? 'tone-formal' : tone === 'friendly' ? 'tone-friendly' : 'tone-professional';
  const fontStyle = (tenantTheme as any)?.font ? { fontFamily: (tenantTheme as any).font } : undefined;
  return (
    <div className={`min-h-screen bg-white text-gray-900 ${toneClass}`} style={fontStyle}>
      {/* Top Info Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="text-gray-600">
            📍 {tenantTheme?.contactInfo?.address ?? ''}
          </div>
          <div className="flex items-center gap-4">
            {tenantTheme?.contactInfo?.phone && (
              <a href={`tel:${tenantTheme.contactInfo.phone}`} className="text-gray-600 hover:text-gray-800">
                📞 {tenantTheme.contactInfo.phone}
              </a>
            )}
            {tenantTheme?.contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${tenantTheme.contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700"
              >
                💬 Chat on WhatsApp
              </a>
            )}
            {tenantTheme?.contactInfo?.email && (
              <a href={`mailto:${tenantTheme.contactInfo.email}`} className="text-gray-600 hover:text-gray-800">
                ✉️ {tenantTheme.contactInfo.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenantTheme?.logoUrl && (
              <img src={tenantTheme.logoUrl} alt={tenantTheme.name ?? 'logo'} className="h-10" />
            )}
            <h1 className="text-xl font-bold" style={{ color: tenantTheme?.primaryColor ?? '#111827' }}>
              {tenantTheme?.name ?? 'Dealer'}
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium ${currentPage === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              Home
            </Link>
            <Link href="/stock" className={`text-sm font-medium ${currentPage === '/stock' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              Stock List
            </Link>
            <Link href="/how-to-buy" className={`text-sm font-medium ${currentPage === '/how-to-buy' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              How to Buy
            </Link>
            <Link href="/about" className={`text-sm font-medium ${currentPage === '/about' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              About Us
            </Link>
            <Link href="/contact" className={`text-sm font-medium ${currentPage === '/contact' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              Contact
            </Link>
            <Link href="/dealer-template/trust" className={`text-sm font-medium ${currentPage === '/trust' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
              Trust
            </Link>
          </nav>
          {/* Mobile menu button - simplified */}
          <button className="md:hidden text-gray-700">
            ☰
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{tenantTheme?.name ?? ''}</h3>
              <p className="text-sm text-gray-600">{tenantTheme?.contactInfo?.address ?? ''}</p>
              {tenantTheme?.slogan && <p className="text-sm text-gray-600 mt-1">{tenantTheme.slogan}</p>}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
              {tenantTheme?.contactInfo?.phone && <p className="text-sm text-gray-600">📞 {tenantTheme.contactInfo.phone}</p>}
              {tenantTheme?.contactInfo?.email && <p className="text-sm text-gray-600">✉️ {tenantTheme.contactInfo.email}</p>}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Links</h4>
              <div className="flex flex-col gap-1 text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-800">Home</Link>
                <Link href="/stock" className="text-gray-600 hover:text-gray-800">Stock List</Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-800">Contact</Link>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            Powered by Denuel Auto
          </div>
        </div>
      </footer>
    </div>
  );
}