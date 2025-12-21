import React, { useState } from 'react';
import { FaBars, FaTimes, FaSearch, FaTag, FaGlobe, FaDollarSign } from 'react-icons/fa';

type Tenant = { logo?: string; name?: string };
type Buyer = { firstName?: string };

interface Props {
  tenant: Tenant;
  buyer?: Buyer | null;
  currentSection: string;
  setCurrentSection: (s: string) => void;
  showAuth?: boolean;
  setShowAuth: (b: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (b: boolean) => void;
  handleLogout: () => void;
  scrollToSection: (s: string) => void;
  locale?: 'en' | 'ja';
  setLocale?: (l: 'en' | 'ja') => void;
  currency?: 'USD' | 'JPY';
  setCurrency?: (c: 'USD' | 'JPY') => void;
  favoritesCount?: number;
  onOpenWishlist?: () => void;
  onOpenSearch?: () => void;
  keyword?: string;
  setKeyword?: (s: string) => void;
  onSearch?: () => void;
}

const PublicHeader: React.FC<Props> = ({ tenant, buyer, currentSection, setCurrentSection, showAuth, setShowAuth, mobileMenuOpen, setMobileMenuOpen, handleLogout, scrollToSection, locale = 'en', setLocale, currency = 'USD', setCurrency, favoritesCount = 0, onOpenWishlist, onOpenSearch, keyword = '', setKeyword, onSearch }) => {
  const isHome = currentSection === 'home';
  const [localKeyword, setLocalKeyword] = useState(keyword);

  const handleSearch = () => {
    if (setKeyword) setKeyword(localKeyword);
    if (onSearch) onSearch();
    if (onOpenSearch) onOpenSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <nav className={`${isHome ? 'bg-transparent absolute inset-x-0 top-0 z-50' : 'bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50'} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top header bar with language, currency, login, favorites */}
        <div className="hidden md:flex justify-between items-center py-4 text-base text-gray-600 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaGlobe className="text-gray-500" />
              <select
                value={locale}
                onChange={(e) => setLocale?.(e.target.value as 'en' | 'ja')}
                className="bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer"
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <FaDollarSign className="text-gray-500" />
              <select
                value={currency}
                onChange={(e) => setCurrency?.(e.target.value as 'USD' | 'JPY')}
                className="bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer"
                aria-label="Select currency"
              >
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {buyer ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-medium text-sm">Welcome,</span>
                  <span className="text-blue-600 font-semibold">{buyer.firstName || 'User'}</span>
                </div>
                <button
                  onClick={() => setCurrentSection('dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-500"
              >
                Login
              </button>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg font-medium text-gray-700 hover:text-red-600 hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md group"
              onClick={onOpenWishlist}
            >
              <span className="text-red-500 group-hover:text-red-600 transition-colors duration-200 text-lg">♥</span>
              <span>{favoritesCount} Favorites</span>
            </button>
          </div>
        </div>

        {/* Main header bar with logo, search, navigation */}
        <div className="flex justify-between items-center h-24">
          {/* Logo section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollToSection('home')}
              className="flex items-center gap-4 focus:outline-none group"
            >
              <img
                src={tenant?.logo}
                alt={tenant?.name}
                className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className={`${isHome ? 'text-white' : 'text-gray-900'} font-bold text-2xl tracking-tight hover:text-blue-600 transition-colors duration-200`}>
                {tenant?.name}
              </span>
            </button>
          </div>

          {/* Central search bar */}
          <div className="flex-1 max-w-3xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for cars by make, model, or keyword..."
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                aria-label="Search for cars"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </div>

          {/* Navigation and special buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Main navigation links */}
            <div className="flex items-center gap-2">
              <button
                className="px-6 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative group"
                onClick={() => scrollToSection('browse')}
              >
                Used Cars
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative group"
                onClick={() => scrollToSection('autoparts')}
              >
                Auto Parts
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative group"
                onClick={() => scrollToSection('services')}
              >
                Services
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </button>
            </div>

            {/* Special navigation buttons */}
            <div className="flex items-center gap-3 ml-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={() => scrollToSection('deals')}
                aria-label="Scroll to Deals section"
              >
                Deals
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                onClick={() => scrollToSection('specials')}
                aria-label="Scroll to Today's Special section"
              >
                Today Special
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
            aria-label="toggle-mobile-menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-xl text-gray-700" /> : <FaBars className="text-xl text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-6 space-y-1 bg-white shadow-lg">
            {/* Mobile search */}
            <div className="px-6 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={localKeyword}
                  onChange={(e) => setLocalKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pl-10 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentSection('browse')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Browse Cars
            </button>
            <button
              onClick={() => scrollToSection('autoparts')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Auto Parts
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('deals')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Deals
            </button>
            <button
              onClick={() => scrollToSection('specials')}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg mx-6"
            >
              Today Special
            </button>

            <div className="border-t border-gray-200 mt-6 pt-6 mx-4">
              {buyer ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Welcome, {buyer.firstName || 'User'}</span>
                  </div>
                  <button
                    onClick={() => setCurrentSection('dashboard')}
                    className="block w-full text-left px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="block w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default PublicHeader;
