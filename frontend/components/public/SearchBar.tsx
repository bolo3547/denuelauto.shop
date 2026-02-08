'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAutocomplete, { AutocompleteSuggestion } from './useAutocomplete';

type SearchBarProps = {
  tenantSlug?: string;
  defaultQuery?: string;
  className?: string;
  onSearch?: (q: string) => void; // optional callback to perform search navigation
  country?: string;
  currency?: string;
};

function saveRecentSearch(tenant: string | undefined, query: string) {
  try {
    const key = `recentSearches-${tenant ?? 'global'}`;
    const list = JSON.parse(localStorage.getItem(key) ?? '[]');
    const filtered = list.filter((x: string) => x !== query);
    const newList = [query, ...filtered].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(newList));
  } catch (err) {
    // ignore
  }
}

function getRecentSearches(tenant: string | undefined) {
  try {
    const key = `recentSearches-${tenant ?? 'global'}`;
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch (err) {
    return [];
  }
}

export default function SearchBar({ tenantSlug, defaultQuery = '', className = '', onSearch, country, currency }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [debounced, setDebounced] = useState(q);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const { items: suggestions, loading } = useAutocomplete(debounced, tenantSlug ?? 'denuel-auto');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = `header-suggestions-${tenantSlug ?? 'global'}`;

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (debounced && debounced.length > 0) setOpen(true);
    else setOpen(false);
    setActiveIndex(-1);
  }, [debounced, suggestions.length]);

  function onSelectSuggestion(s: AutocompleteSuggestion) {
    // Sanitize suggestion label to prevent XSS from API-driven strings
    const searchTerm = s.label.replace(/[<>"'&]/g, '');
    saveRecentSearch(tenantSlug, searchTerm);
    redirectSearch(searchTerm);
  }

  function onSubmit(ev?: React.FormEvent) {
    ev?.preventDefault();
    const term = q.trim();
    if (!term) return;
    saveRecentSearch(tenantSlug, term);
    if (onSearch) {
      onSearch(term);
    } else {
      redirectSearch(term);
    }
  }

  function redirectSearch(term: string) {
    // If the caller passed in country / currency, prefer those
    const c = country ?? localStorage.getItem(`tenant-country-${tenantSlug ?? 'global'}`) ?? 'US';
    const cur = currency ?? localStorage.getItem(`tenant-currency-${tenantSlug ?? 'global'}`) ?? 'USD';
    const params = new URLSearchParams({
      query: term,
      country: c,
      currency: cur,
    });
    router.push(`/t/${tenantSlug ?? 'denuel-auto'}/stock?${params.toString()}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, (suggestions?.length || 0) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions && suggestions[activeIndex]) {
        onSelectSuggestion(suggestions[activeIndex]);
      } else {
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const recent = getRecentSearches(tenantSlug);

  return (
    <div className={`relative w-full max-w-full ${className}`}>
      <form onSubmit={onSubmit} role="search" aria-label="Search inventory">
        <div className="flex items-center bg-white shadow-sm rounded-full px-3 py-2 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-orange-500">
          {open ? (
            <input
              ref={inputRef}
              aria-controls={listboxId}
              aria-expanded="true"
              role="combobox"
              aria-autocomplete="list"
              className="w-full bg-transparent outline-none text-sm sm:text-base px-2"
              placeholder="Search by make, model, stock number..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search inventory"
            />
          ) : (
            <input
              ref={inputRef}
              aria-controls={listboxId}
              aria-expanded="false"
              role="combobox"
              aria-autocomplete="list"
              className="w-full bg-transparent outline-none text-sm sm:text-base px-2"
              placeholder="Search by make, model, stock number..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search inventory"
            />
          )}
          <button
            type="submit"
            aria-label="Search"
            className="ml-2 inline-flex items-center rounded-full bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 text-sm font-medium shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions listbox */}
      {open && (suggestions.length > 0 || recent.length > 0) && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggested search results"
          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-auto ring-1 ring-gray-200"
        >
          {suggestions.length > 0 && (
            <li role="presentation" className="px-3 py-2 text-xs text-gray-500">Suggestions</li>
          )}
          {suggestions.map((s, idx) => {
            if (idx === activeIndex) {
              return (
                <li
                  role="option"
                  tabIndex={0}
                  aria-selected="true"
                  key={`${s.type}-${s.id}-${s.label}`}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => onSelectSuggestion(s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectSuggestion(s);
                  }}
                  className={`cursor-pointer flex items-center px-3 py-2 hover:bg-gray-50 bg-gray-100`}
                >
                  <div className="w-8 flex-none text-sm text-gray-600">
                    {s.type === 'make' ? '🔧' : s.type === 'model' ? '🚘' : '📦'}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-sm">{s.label}</div>
                    {s.meta?.stockCount && (typeof s.meta.stockCount === 'number' || typeof s.meta.stockCount === 'string') ? (
                      <div className="text-xs text-gray-500">{String(s.meta.stockCount)} in stock</div>
                    ) : null}
                  </div>
                </li>
              );
            }
            return (
              <li
                role="option"
                tabIndex={0}
                aria-selected="false"
                key={`${s.type}-${s.id}-${s.label}`}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => onSelectSuggestion(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectSuggestion(s);
                }}
                className={`cursor-pointer flex items-center px-3 py-2 hover:bg-gray-50`}
              >
                <div className="w-8 flex-none text-sm text-gray-600">
                  {s.type === 'make' ? '🔧' : s.type === 'model' ? '🚘' : '📦'}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium text-sm">{s.label}</div>
                  {s.meta?.stockCount && (typeof s.meta.stockCount === 'number' || typeof s.meta.stockCount === 'string') ? (
                    <div className="text-xs text-gray-500">{String(s.meta.stockCount)} in stock</div>
                  ) : null}
                </div>
              </li>
            );
          })}

          {suggestions.length === 0 && recent.length > 0 && (
            <>
              <li role="presentation" className="px-3 py-2 text-xs text-gray-500">Recent</li>
              {recent.map((r: string) => (
                <li
                  key={`recent-${r}`}
                  role="option"
                  tabIndex={0}
                  aria-selected="false"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    setQ(r);
                    redirectSearch(r);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setQ(r);
                      if (onSearch) onSearch(r);
                      else redirectSearch(r);
                    }
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-50"
                >
                  <div className="text-sm">{r}</div>
                </li>
              ))}
            </>
          )}
          {loading && (
            <li role="presentation" className="px-3 py-2 text-xs text-gray-600">Loading…</li>
          )}
        </ul>
      )}
    </div>
  );
}
