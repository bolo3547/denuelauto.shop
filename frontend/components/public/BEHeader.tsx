import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { HiOutlineSearch, HiOutlinePhone } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';
// import { Menu } from '@headlessui/react';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import useAutocomplete from '../../hooks/useAutocomplete';
import useTenantHeader from '../../hooks/useTenantHeader';

const BEHeader: React.FC = () => {
  const { tenant, loading } = useTenantHeader();
  const primaryColor = tenant?.theme?.primary;
  const logoUrl = tenant?.logoUrl;
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const { results, loading: autocompleteLoading } = useAutocomplete(debouncedQuery);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoAlt = tenant?.name || 'Denuel Auto';
  const brandPrimary = primaryColor || '#0057A8';

  const placeholder = useMemo(() => {
    return `Search ${tenant?.name || 'cars, models, keywords'}`;
  }, [tenant]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="flex items-center gap-3" aria-label={`${logoAlt} - Home`}>
                <img src={logoUrl || '/logo.svg'} alt={logoAlt} className="h-10 w-auto" />
                <span className="sr-only">{logoAlt}</span>
              </a>
            </Link>
            <div className="hidden md:block w-[560px]">
              <label className="relative block">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <HiOutlineSearch />
                </span>
                <input
                  className="form-input block w-full rounded-full border border-gray-200 px-12 py-3 focus:outline-none focus:ring-2 focus:ring-offset-1"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={placeholder}
                />
                {results && results.length > 0 && (
                  <ul className="absolute mt-2 w-full bg-white border border-gray-100 rounded-lg shadow z-50 max-h-72 overflow-auto">
                    {results.map((r) => (
                      <li key={r.id} className="p-3 hover:bg-gray-50">
                        <Link href={`/cars/${r.id}`}>{r.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <a href="tel:+123456789" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <HiOutlinePhone /> <span>+1 234 567 89</span>
              </a>
              <Link href="/auth/login">
                <a className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <FiUser /> <span>Sign in</span>
                </a>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/sell">
                <a
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow"
                  style={{ background: brandPrimary }}
                >
                  Sell Your Car
                </a>
              </Link>

              <button
                className="md:hidden p-2 rounded-md ring-0 border border-gray-200"
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="p-4">
            <label className="block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input block w-full rounded-full border border-gray-200 px-4 py-3 focus:outline-none"
                placeholder={placeholder}
                aria-label="Search" 
              />
            </label>

            <nav className="mt-4 space-y-2">
              <Link href="/deals"><a className="block py-2">Deals</a></Link>
              <Link href="/specials"><a className="block py-2">Specials</a></Link>
              <Link href="/marketplace"><a className="block py-2">Marketplace</a></Link>
              <Link href="/contact"><a className="block py-2">Contact</a></Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default BEHeader;
