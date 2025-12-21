import { useEffect, useState } from 'react';

export type AutocompleteResult = {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  url?: string;
};

export default function useAutocomplete(query: string) {
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tenants/header-autocomplete?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) {
          setResults([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(() => fetchData(), 150);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  return { results, loading } as const;
}
