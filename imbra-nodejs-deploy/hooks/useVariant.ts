import { useEffect, useState } from 'react';

export default function useVariant(experimentName = 'cta_variant') {
  const [variant, setVariant] = useState<'A'|'B'>('A');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const q = url.searchParams.get('variant');
    if (q === 'B') {
      setVariant('B');
      localStorage.setItem(experimentName, 'B');
      return;
    }
    const saved = localStorage.getItem(experimentName);
    if (saved === 'B') {
      setVariant('B');
      return;
    }
    // Randomize small 50/50 split if no saved variant
    const r = Math.random() < 0.5 ? 'A' : 'B';
    setVariant(r as 'A'|'B');
    localStorage.setItem(experimentName, r);
  }, [experimentName]);

  return variant;
}
