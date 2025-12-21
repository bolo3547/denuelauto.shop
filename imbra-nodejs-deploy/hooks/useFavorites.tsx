import { useCallback, useState, useEffect } from 'react';
import api from 'utils/api';

export function useFavorites(tenantSlug?: string) {
  const key = `favs:${tenantSlug || 'global'}`;
  const [items, setItems] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    // if user has a token, prefer server list
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      (async () => {
        try {
          const res = await api.get('/buyer/favorites');
          if (res.data && Array.isArray(res.data)) {
            const cars = res.data.map((f: any) => f.car || f);
            setItems(cars);
          }
        } catch (e) {}
      })();
    }
  }, [key]);

  const add = useCallback((car: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      // call server to add
      api.post(`/buyer/favorites/${car.id}`).then(() => {
        const next = [...items, car];
        setItems(next);
      }).catch(() => {
        const next = [...items, car];
        setItems(next); localStorage.setItem(key, JSON.stringify(next));
      });
      return;
    }
    const next = [...items, car];
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [items, key]);

  const remove = useCallback((id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      api.delete(`/buyer/favorites/${id}`).then(() => {
        const next = items.filter(i => i.id !== id);
        setItems(next);
      }).catch(() => { const next = items.filter(i => i.id !== id); setItems(next); localStorage.setItem(key, JSON.stringify(next)); });
      return;
    }
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [items, key]);

  const toggle = useCallback((car: any) => { items.find(i => i.id === car.id) ? remove(car.id) : add(car); }, [items, remove, add]);

  const isFavorite = (id: string) => items.some(i => i.id === id);
  const addFavorite = (car: any) => add(car);
  const removeFavorite = (id: string) => remove(id);
  const toggleFavorite = (car: any) => toggle(car);
  return { items, favorites: items, addFavorite, removeFavorite, isFavorite, toggleFavorite } as const;
}

export default useFavorites;
