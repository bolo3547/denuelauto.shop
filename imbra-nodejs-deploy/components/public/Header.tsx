"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import useTenantHeader from '../../hooks/useTenantHeader';
import PublicTenantThemeProvider from './TenantThemeProvider';
import { DEFAULT_THEME } from '../TenantThemeProvider';

// Icons (small and not exhaustive) - OK to substitute with your icon system
import { FaBars, FaTimes, FaPhone, FaUser, FaPlus, FaGlobe, FaDollarSign } from 'react-icons/fa';

interface HeaderProps {
  tenantSlug: string;
  initialTenant?: any; // optional initial tenant theme (SSR)
}

export default function Header({ tenantSlug, initialTenant }: HeaderProps) {
  const router = useRouter();
  const { tenant, loading } = useTenantHeader(tenantSlug, initialTenant);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [country, setCountry] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');

  // Keep consistent localStorage keys
  const COUNTRY_KEY = `denuel:country:${tenantSlug}`;
  const CURRENCY_KEY = `denuel:currency:${tenantSlug}`;

  useEffect(() => {
    // initialize country & currency from tenant or localStorage
    const lsCountry = typeof window !== 'undefined' ? localStorage.getItem(COUNTRY_KEY) : null;
    const lsCurrency = typeof window !== 'undefined' ? localStorage.getItem(CURRENCY_KEY) : null;
    setCountry(lsCountry ?? tenant?.defaultCountry ?? (tenant?.availableCountries?.[0] ?? 'US'));
    setCurrency(lsCurrency ?? tenant?.currencies?.[0] ?? 'USD');
  }, [tenantSlug, tenant]);

  useEffect(() => {
    // sticky header on scroll
    const onScroll = () => setSticky(window.scrollY > 48);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // focus management for mobile menu
  const menuOpenBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (mobileOpen) {
      // set focus to close button when menu opens
      setTimeout(() => menuCloseBtnRef.current?.focus(), 0);
    } else {
      // return focus to menu button when menu closes
      setTimeout(() => menuOpenBtnRef.current?.focus(), 0);
    }
  }, [mobileOpen]);

  // Update aria-expanded/aria-pressed attributes on the menu button via DOM to satisfy strict lint rules
  useEffect(() => {
    const btn = menuOpenBtnRef.current;
    if (!btn) return;
    btn.setAttribute('aria-expanded', mobileOpen ? 'true' : 'false');
    btn.setAttribute('aria-pressed', mobileOpen ? 'true' : 'false');
  }, [mobileOpen]);

  // close mobile on escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    if (mobileOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const onSearch = (q: string) => {
    // Compose redirect URL with current tenant slug and selected country/currency
    const url = `/t/${tenantSlug}/stock?query=${encodeURIComponent(q || '')}&country=${encodeURIComponent(country || '')}&currency=${encodeURIComponent(currency || '')}`;
    // TODO: consider adding analytics event here (search term & filters)
    // TODO: consider client-side routing with router.push to keep SPA navigation.
    router.push(url);
  };

  const openWhatsApp = () => {
    const phone = tenant?.supportPhone || '';
    if (!phone) return;
    const text = encodeURIComponent(`Hello ${tenant?.name || ''}, I have a question about your listings.`);
    const url = `https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${text}`;
    // on mobile will open WhatsApp; on desktop, WhatsApp web
    window.open(url, '_blank');
  };

  const onCountryChange = (c: string) => {
    setCountry(c);
    if (typeof window !== 'undefined') localStorage.setItem(COUNTRY_KEY, c);
    // Update URL query params if needed (optional)
    const params = new URLSearchParams(window.location.search);
    params.set('country', c);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const onCurrencyChange = (c: string) => {
    setCurrency(c);
    if (typeof window !== 'undefined') localStorage.setItem(CURRENCY_KEY, c);
    const params = new URLSearchParams(window.location.search);
    params.set('currency', c);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const pathname = usePathname();

  const quickLinks = [
    { label: 'Browse Cars', href: `/t/${tenantSlug}/stock` },
    { label: 'Autoparts', href: `/t/${tenantSlug}/parts` },
    { label: 'Services', href: `/t/${tenantSlug}/services` },
  ];

  const theme = tenant?.theme || DEFAULT_THEME;

  return (
    <PublicTenantThemeProvider theme={theme}>
      <header className={`w-full z-50 ${sticky ? 'shadow-md' : ''} transition-shadow duration-200 bg-[var(--surface)]`}>
        <a href="#main" className="sr-only focus:not-sr-only px-4 py-2 text-sm">Skip to main content</a>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: logo & mobile */}
              <div className="flex items-center gap-4">
                <button ref={menuOpenBtnRef} className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Open mobile menu" onClick={() => setMobileOpen(true)}>
                <FaBars />
              </button>
              <Link href={`/t/${tenantSlug}`} className="flex items-center gap-3" aria-label={`${tenant?.name || 'Denuel Auto'} homepage`}>
                <img src={tenant?.logoUrl || '/api/placeholder/140/40'} alt={`${tenant?.name || 'Denuel Auto'} logo`} className="h-10 w-auto object-contain" />
                {/* Keep the tenant name for screen readers only (visually hidden) so we still expose it to assistive tech */}
                <span className="sr-only">{tenant?.name || 'Denuel Auto'}</span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="flex-1 px-4 mx-auto max-w-[900px] w-full">
              <SearchBar tenantSlug={tenantSlug} onSearch={onSearch} country={country} currency={currency} />
            </div>

            {/* Right: quick links & CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <select aria-label="Select country" title="Select country" value={country} onChange={(e) => onCountryChange(e.target.value)} className="px-2 py-1 rounded-md border border-gray-200 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  {tenant?.availableCountries?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select aria-label="Select currency" title="Select currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="px-2 py-1 rounded-md border border-gray-200 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  {tenant?.currencies?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <nav className="flex items-center gap-3" aria-label="Primary navigation">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className={`text-sm ${pathname === link.href ? 'font-semibold text-[var(--accent)]' : 'text-gray-600 hover:text-[var(--accent)]'}`}>{link.label}</Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <a href={`tel:${tenant?.supportPhone || ''}`} className="text-sm text-gray-600 hover:text-[var(--accent)] flex items-center gap-2" title={`Call ${tenant?.supportPhone || ''}`}>
                  <FaPhone /> <span className="hidden sm:inline">{tenant?.supportPhone || 'Support'}</span>
                </a>
                <button className="bg-[var(--accent)] text-white px-4 py-2 rounded-md font-semibold hover:opacity-95" onClick={() => router.push(`/t/${tenantSlug}/sell`)}>
                  <FaPlus className="inline mr-2" /> Sell/Upload
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => router.push(`/account/login`)}>
                  <FaUser /> Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile slide over */}
        {mobileOpen && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-40" role="presentation" onClick={() => setMobileOpen(false)}>
            <div role="dialog" aria-modal="true" aria-label="Mobile navigation" className="fixed inset-y-0 left-0 w-full max-w-sm bg-[var(--surface)] p-4 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <Link href={`/t/${tenantSlug}`} className="flex items-center gap-3" aria-label={`${tenant?.name} homepage`}>
                  <img src={tenant?.logoUrl || '/api/placeholder/140/40'} alt={`${tenant?.name || 'Denuel Auto'} logo`} className="h-10 object-contain" />
                </Link>
                <button ref={menuCloseBtnRef} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Close mobile menu" onClick={() => setMobileOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="mb-4">
                <SearchBar tenantSlug={tenantSlug} onSearch={(q) => { setMobileOpen(false); onSearch(q); }} country={country} currency={currency} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaGlobe />
                  <select aria-label="Select country" title="Select country" value={country} onChange={(e) => onCountryChange(e.target.value)} className="px-2 py-1 rounded-md border border-gray-200 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                    {tenant?.availableCountries?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <FaDollarSign />
                  <select aria-label="Select currency" title="Select currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="px-2 py-1 rounded-md border border-gray-200 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                    {tenant?.currencies?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <nav className="mt-6 space-y-3">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100" onClick={() => setMobileOpen(false)}>{link.label}</Link>
                ))}
              </nav>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-[var(--accent)] text-white px-4 py-2 rounded-md font-semibold" onClick={() => router.push(`/t/${tenantSlug}/sell`)}>Sell/Upload</button>
                <button className="flex-1 border border-gray-200 px-4 py-2 rounded-md text-sm" onClick={() => router.push(`/account/login`)}>Login</button>
              </div>

              <div className="mt-10 text-sm text-gray-600">
                <div>Support: <a href={`tel:${tenant?.supportPhone}`}>{tenant?.supportPhone}</a></div>
                {/* Hide branding name/marketing text from the mobile menu; keep it available to screen readers only */}
                <div className="mt-2 sr-only">{tenant?.name} - Exporting quality used vehicles</div>
              </div>
            </div>
          </div>
        )}

        {/* JSON-LD organization structured data (SSR-friendly) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": tenant?.name || 'Denuel Auto',
            "url": typeof window !== 'undefined' ? window.location.origin : '',
            "logo": tenant?.logoUrl || '',
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": tenant?.supportPhone || '',
              "contactType": "Customer service"
            }]
          })
        }} />
      </header>
    </PublicTenantThemeProvider>
  );
}
