import { useState, useEffect, useCallback } from 'react';
import { DealerCar } from '../types/dealerCar';

// Canonical useCompare: keep typed and rotate when > 4
export default function useCompare(tenantSlug?: string) {
  const key = `compare:${tenantSlug || 'global'}`;
  const [items, setItems] = useState<DealerCar[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') as DealerCar[]; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch (e) { /* ignore */ }
  }, [key, items]);

  const add = useCallback((car: DealerCar) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === car.id);
      if (exists) return prev;
      const next = prev.length >= 4 ? [...prev.slice(1), car] : [...prev, car];
      try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, [key]);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, [key]);

  const clear = useCallback(() => { try { localStorage.removeItem(key); } catch (e) {} setItems([]); }, [key]);

  return { items, add, remove, clear } as const;
}
