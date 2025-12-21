// Client-side autocomplete hook. Returns suggestions and loading states.
// The endpoint contract: GET /api/t/:tenantSlug/public/header-autocomplete?q=TERM

import { useEffect, useState } from 'react';

export type AutocompleteSuggestion = {
  type: 'make' | 'model' | 'stock';
  id: string | number;
  label: string;
  meta?: Record<string, unknown>;
};

export default function useAutocomplete(query: string, tenantSlug = 'denuel-auto') {
  const [items, setItems] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!query || query.trim().length < 1) {
      setItems([]);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/t/${tenantSlug}/public/header-autocomplete?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error(`Autocomplete fetch failed: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setItems(data || []);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error)?.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [query, tenantSlug]);

  return { items, loading, error };
}
