'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaBars, FaTimes, FaPhone, FaEnvelope, FaWhatsapp, FaUser, FaHeart,
  FaBalanceScale, FaSearch, FaGlobe, FaChevronDown, FaSignInAlt,
  FaUserPlus, FaCarSide, FaQuestionCircle, FaCreditCard, FaMapMarkerAlt,
  FaHeadset, FaHistory, FaStar, FaBookmark
} from 'react-icons/fa';
import { useTenantTheme } from '../tenant';

// =====================================================
// TYPES
// =====================================================
interface PublicHeaderProps {
  tenantSlug: string;
}

interface AutocompleteResult {
  type: 'make' | 'model' | 'stockNo' | 'keyword';
  value: string;
  label: string;
  count?: number;
}

// =====================================================
// SEARCH BAR COMPONENT
// =====================================================
function HeaderSearchBar({ tenantSlug, onSearch }: { tenantSlug: string; onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'keyword' | 'stockNo'>('keyword');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/t/${tenantSlug}/public/autocomplete?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  const handleSuggestionClick = (suggestion: AutocompleteResult) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    onSearch(suggestion.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-center bg-gray-100 rounded-full border-2 border-transparent focus-within:border-[var(--accent)] transition-colors">
        {/* Search Mode Toggle */}
        <div className="pl-4 pr-2">
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as 'keyword' | 'stockNo')}
            className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer"
            aria-label="Search mode"
          >
            <option value="keyword">Keyword</option>
            <option value="stockNo">Stock No.</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={searchMode === 'stockNo' ? 'Enter Stock Number...' : 'Search make, model, or keyword...'}
          className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
          aria-label="Search vehicles"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="bg-[var(--accent)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          aria-label="Search"
        >
          <FaSearch />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion.type}-${suggestion.value}-${idx}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
            >
              <span className="text-gray-400">
                {suggestion.type === 'make' && <FaCarSide />}
                {suggestion.type === 'model' && <FaCarSide />}
                {suggestion.type === 'stockNo' && <FaSearch />}
                {suggestion.type === 'keyword' && <FaSearch />}
              </span>
              <span className="flex-1">
                <span className="font-medium text-gray-800">{suggestion.label}</span>
                {suggestion.count && (
                  <span className="text-gray-500 text-sm ml-2">({suggestion.count} cars)</span>
                )}
              </span>
              <span className="text-xs text-gray-400 uppercase">{suggestion.type}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

// =====================================================
// MAIN HEADER COMPONENT
// =====================================================
export default function PublicHeader({ tenantSlug }: PublicHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { settings, currency, country, setCurrency, setCountry } = useTenantTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 48);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      closeButtonRef.current?.focus();
    } else {
      menuButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (country) params.set('country', country);
    if (currency) params.set('currency', currency);
    router.push(`/t/${tenantSlug}/stock?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  const openWhatsApp = () => {
    const phone = settings.support.whatsappNumber;
    if (!phone) return;
    const text = encodeURIComponent(`Hello ${settings.tenantName}, I have a question about your vehicles.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // Navigation links
  const mainNavLinks = [
    { href: `/t/${tenantSlug}/stock`, label: 'Browse Stock', icon: FaCarSide },
    { href: `/t/${tenantSlug}/help/how-to-buy`, label: 'How to Buy', icon: FaQuestionCircle },
    { href: `/t/${tenantSlug}/help/how-to-pay`, label: 'How to Pay', icon: FaCreditCard },
  ];

  const mobileNavLinks = [
    { href: `/t/${tenantSlug}/stock`, label: 'Browse Stock', icon: FaCarSide },
    { href: `/t/${tenantSlug}/stock?filter=deals`, label: 'Best Deals', icon: FaStar },
    { href: `/t/${tenantSlug}/account/favorites`, label: 'My Favorites', icon: FaHeart },
    { href: `/t/${tenantSlug}/account/compare`, label: 'Compare Cars', icon: FaBalanceScale },
    { href: `/t/${tenantSlug}/account/saved-searches`, label: 'Saved Searches', icon: FaBookmark },
    { href: `/t/${tenantSlug}/help/how-to-buy`, label: 'How to Buy', icon: FaQuestionCircle },
    { href: `/t/${tenantSlug}/help/how-to-pay`, label: 'How to Pay', icon: FaCreditCard },
    { href: `/t/${tenantSlug}/help/faq`, label: 'FAQ', icon: FaHeadset },
    { href: `/t/${tenantSlug}/contact`, label: 'Contact Us', icon: FaEnvelope },
    { href: `/t/${tenantSlug}/locations`, label: 'Our Locations', icon: FaMapMarkerAlt },
  ];

  return (
    <>
      <header className={`w-full z-50 bg-[var(--surface)] ${isSticky ? 'fixed top-0 shadow-lg' : ''} transition-shadow duration-200`}>
        {/* Skip to main content */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--accent)] text-white px-4 py-2 rounded z-[100]">
          Skip to main content
        </a>

        {/* ========== ROW A: Utility Bar ========== */}
        <div className="bg-gray-900 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Country & Currency selectors */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FaGlobe className="text-gray-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                    aria-label="Select country"
                  >
                    {settings.countries?.map((c) => (
                      <option key={c} value={c} className="text-gray-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="h-4 w-px bg-gray-600" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  aria-label="Select currency"
                >
                  {settings.currencies?.map((c) => (
                    <option key={c} value={c} className="text-gray-900">{c}</option>
                  ))}
                </select>
              </div>

              {/* Center: Support info (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-4 text-gray-300">
                {settings.support.phone && (
                  <a href={`tel:${settings.support.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                    <FaPhone className="text-xs" />
                    <span>{settings.support.phone}</span>
                  </a>
                )}
                {settings.support.email && (
                  <a href={`mailto:${settings.support.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                    <FaEnvelope className="text-xs" />
                    <span>{settings.support.email}</span>
                  </a>
                )}
              </div>

              {/* Right: WhatsApp + Auth */}
              <div className="flex items-center gap-3">
                {settings.support.whatsappNumber && (
                  <button
                    onClick={openWhatsApp}
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                    aria-label="Chat on WhatsApp"
                  >
                    <FaWhatsapp />
                    <span className="hidden sm:inline">Inquiry</span>
                  </button>
                )}
                <div className="h-4 w-px bg-gray-600 hidden sm:block" />
                <Link
                  href={`/t/${tenantSlug}/auth/login`}
                  className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                >
                  <FaSignInAlt className="text-xs" />
                  <span>Login</span>
                </Link>
                <Link
                  href={`/t/${tenantSlug}/auth/register`}
                  className="hidden sm:flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                >
                  <FaUserPlus className="text-xs" />
                  <span>Register</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ROW B: Main Header ========== */}
        <div className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                ref={menuButtonRef}
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <FaBars className="text-xl" />
              </button>

              {/* Logo */}
              <Link href={`/t/${tenantSlug}`} className="flex-shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.logoAlt || `${settings.tenantName} logo`}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-[var(--primary)]">{settings.tenantName}</span>
                )}
              </Link>

              {/* Search Bar (Desktop) */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <HeaderSearchBar tenantSlug={tenantSlug} onSearch={handleSearch} />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? 'bg-gray-100 text-[var(--accent)]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--accent)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="h-6 w-px bg-gray-200 hidden lg:block mx-2" />

                {/* Favorites */}
                <Link
                  href={`/t/${tenantSlug}/account/favorites`}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  aria-label="Favorites"
                  title="My Favorites"
                >
                  <FaHeart className="text-lg text-gray-600" />
                </Link>

                {/* Compare */}
                <Link
                  href={`/t/${tenantSlug}/account/compare`}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  aria-label="Compare"
                  title="Compare Cars"
                >
                  <FaBalanceScale className="text-lg text-gray-600" />
                </Link>

                {/* Browse Stock CTA */}
                <Link
                  href={`/t/${tenantSlug}/stock`}
                  className="hidden sm:flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <FaCarSide />
                  <span>Browse Stock</span>
                </Link>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden mt-3">
              <HeaderSearchBar tenantSlug={tenantSlug} onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer when header is sticky */}
      {isSticky && <div className="h-[140px] lg:h-[108px]" />}

      {/* ========== Mobile Menu Drawer ========== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href={`/t/${tenantSlug}`} onClick={() => setMobileMenuOpen(false)}>
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.logoAlt || `${settings.tenantName} logo`}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="font-bold text-lg">{settings.tenantName}</span>
                )}
              </Link>
              <button
                ref={closeButtonRef}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Country/Currency Selectors */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    {settings.countries?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    {settings.currencies?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {mobileNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === link.href
                          ? 'bg-[var(--accent)] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <link.icon className="text-lg" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Link
                href={`/t/${tenantSlug}/auth/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <FaSignInAlt />
                <span>Login</span>
              </Link>
              <Link
                href={`/t/${tenantSlug}/auth/register`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <FaUserPlus />
                <span>Create Account</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Need help?</p>
              <div className="space-y-2">
                {settings.support.phone && (
                  <a
                    href={`tel:${settings.support.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <FaPhone className="text-[var(--accent)]" />
                    <span>{settings.support.phone}</span>
                  </a>
                )}
                {settings.support.whatsappNumber && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openWhatsApp();
                    }}
                    className="flex items-center gap-2 text-sm text-green-600"
                  >
                    <FaWhatsapp />
                    <span>Chat on WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
