import React, { useEffect, useState, useRef } from 'react';
import { makeApiUrl } from '@/lib/config/api';

interface Suggestion {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  img?: string;
}

interface Props {
  tenantSlug: string;
  query: string;
  onSelect: (s: Suggestion) => void;
  onSuggestionClick?: (text: string) => void;
}

export default function HeaderAutosuggest({ tenantSlug, query, onSelect, onSuggestionClick }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setActiveIdx(-1);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const q = encodeURIComponent(query);
        const res = await fetch(makeApiUrl(`/t/${tenantSlug}/public/cars?q=${q}&limit=6`));
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : (data.items || []);
          const list = (items as any[]).map(i => ({
            id: i.id || i.stockNo || i._id || JSON.stringify(i),
            make: i.make,
            model: i.model,
            year: i.year,
            price: i.price,
            img: i.img || (i.images && i.images[0]) || '/api/placeholder/120/80'
          }));
          setSuggestions(list.slice(0, 6));
          setActiveIdx(-1);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query, tenantSlug]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!suggestions.length) return;
      if (e.key === 'ArrowDown') {
        setActiveIdx(idx => Math.min(idx + 1, suggestions.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setActiveIdx(idx => Math.max(idx - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        onSelect(suggestions[activeIdx]);
        setActiveIdx(-1);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [suggestions, activeIdx, onSelect]);

  if (!query || suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
      <ul className="max-h-64 overflow-auto" ref={listRef}>
        {suggestions.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => { onSelect(s); if (onSuggestionClick) onSuggestionClick(`${s.make || ''} ${s.model || ''}`); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-2 hover:bg-gray-100 ${activeIdx === i ? 'bg-blue-50' : ''}`}
              tabIndex={-1}
            >
              <img src={s.img || '/api/placeholder/120/80'} alt="car" className="w-12 h-8 object-cover rounded border" />
              <div className="flex-1">
                <div className="text-sm font-medium">{s.make} {s.model}</div>
                <div className="text-xs text-gray-500">{s.year || ''}</div>
              </div>
              {s.price && <div className="text-xs font-semibold text-blue-700">${s.price.toLocaleString()}</div>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
