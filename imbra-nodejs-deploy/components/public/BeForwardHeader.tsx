"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaPhone, FaWhatsapp, FaUser, FaHeart, FaSearch, 
  FaBars, FaTimes, FaGlobe, FaChevronDown, FaCarSide,
  FaQuestionCircle, FaShoppingCart
} from 'react-icons/fa';

interface BeForwardHeaderProps {
  tenantSlug: string;
  tenant?: {
    name?: string;
    logoUrl?: string;
    phone?: string;
    whatsapp?: string;
    primaryColor?: string;
    baseCurrency?: string;
    country?: string;
  };
}

export default function BeForwardHeader({ tenantSlug, tenant }: BeForwardHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [country, setCountry] = useState('Zambia');
  const [currency, setCurrency] = useState('ZMW');
  const [searchQuery, setSearchQuery] = useState('');
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    // Load preferences from localStorage
    const savedCountry = localStorage.getItem(`denuel:country:${tenantSlug}`);
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCountry) setCountry(savedCountry);
    if (savedCurrency) setCurrency(savedCurrency);
    
    // Load favorites count
    const favs = localStorage.getItem(`favs:${tenantSlug}`);
    if (favs) setFavCount(JSON.parse(favs).length);
    
    const handleStorage = () => {
      const favs = localStorage.getItem(`favs:${tenantSlug}`);
      if (favs) setFavCount(JSON.parse(favs).length);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [tenantSlug]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    localStorage.setItem(`denuel:country:${tenantSlug}`, newCountry);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem(`denuel:currency:${tenantSlug}`, newCurrency);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/t/${tenantSlug}/stock?q=${encodeURIComponent(searchQuery)}`);
  };

  const primaryColor = tenant?.primaryColor || '#0052CC';

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Row 1: Utility Bar */}
      <div className="bg-gray-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            {/* Left: Country & Currency */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaGlobe className="w-3 h-3" />
                <select 
                  value={country} 
                  onChange={handleCountryChange}
                  className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer"
                  aria-label="Select country"
                >
                  <option value="Zambia" className="text-gray-900">Zambia</option>
                  <option value="Zimbabwe" className="text-gray-900">Zimbabwe</option>
                  <option value="Tanzania" className="text-gray-900">Tanzania</option>
                  <option value="Kenya" className="text-gray-900">Kenya</option>
                  <option value="Uganda" className="text-gray-900">Uganda</option>
                  <option value="Malawi" className="text-gray-900">Malawi</option>
                  <option value="DRC" className="text-gray-900">DRC</option>
                  <option value="Mozambique" className="text-gray-900">Mozambique</option>
                </select>
              </div>
              <div className="h-4 w-px bg-gray-600" />
              <select 
                value={currency} 
                onChange={handleCurrencyChange}
                className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer"
                aria-label="Select currency"
              >
                <option value="ZMW" className="text-gray-900">ZMW (Kwacha)</option>
                <option value="USD" className="text-gray-900">USD ($)</option>
                <option value="ZAR" className="text-gray-900">ZAR (Rand)</option>
              </select>
            </div>

            {/* Right: Contact & Auth */}
            <div className="flex items-center gap-4">
              {tenant?.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
                  <FaPhone className="w-3 h-3" />
                  <span className="hidden sm:inline">{tenant.phone}</span>
                </a>
              )}
              {tenant?.whatsapp && (
                <a 
                  href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <FaWhatsapp className="w-3 h-3" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}
              <div className="h-4 w-px bg-gray-600" />
              <Link href={`/t/${tenantSlug}/login`} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
                <FaUser className="w-3 h-3" />
                <span>Login</span>
              </Link>
              <Link 
                href={`/t/${tenantSlug}/register`} 
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Main Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href={`/t/${tenantSlug}`} className="flex items-center gap-2 flex-shrink-0">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name || 'Dealer'} className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(tenant?.name || 'D')[0]}
                  </div>
                  <span className="font-bold text-lg text-gray-900 hidden sm:block">{tenant?.name || 'Denuel Auto'}</span>
                </div>
              )}
            </Link>

            {/* Center: Big Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Make, Model, Keyword or Stock No..."
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  aria-label="Search cars"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Search"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right: Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link 
                href={`/t/${tenantSlug}/favorites`} 
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors relative"
              >
                <FaHeart className="w-4 h-4" />
                <span className="text-sm">Favorites</span>
                {favCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <Link 
                href={`/t/${tenantSlug}/stock`} 
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FaCarSide className="w-4 h-4" />
                <span>Browse Stock</span>
              </Link>
              <Link 
                href={`/t/${tenantSlug}/how-to-buy`} 
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors text-sm"
              >
                <FaQuestionCircle className="w-4 h-4" />
                <span>How to Buy</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cars..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg text-sm"
                  aria-label="Search cars"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg"
                  aria-label="Search"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              </div>
            </form>
            
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-2">
              <Link href={`/t/${tenantSlug}`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">Home</Link>
              <Link href={`/t/${tenantSlug}/stock`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">Browse Stock</Link>
              <Link href={`/t/${tenantSlug}/favorites`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">Favorites ({favCount})</Link>
              <Link href={`/t/${tenantSlug}/how-to-buy`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">How to Buy</Link>
              <Link href={`/t/${tenantSlug}/financing`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">Financing</Link>
              <Link href={`/t/${tenantSlug}/contact`} className="py-2 px-3 text-gray-700 hover:bg-gray-100 rounded">Contact</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
