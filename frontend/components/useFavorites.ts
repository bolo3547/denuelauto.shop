"use client";
import { useState, useEffect } from 'react';

export function useFavorites(tenantSlug: string = 'default') {
  const storageKey = `denuel_auto_favorites_${tenantSlug}`;
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, [storageKey]);

  const addFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(fav => fav !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}