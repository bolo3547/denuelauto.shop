"use client";
"use client";
import api from '../utils/api';
import { useEffect, useState } from 'react';

export default function FavoriteButton({ carId, slug = 'sample-dealer' }: { carId?: string, slug?: string }) {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`favs:${slug}`) || '[]';
      const arr = JSON.parse(raw);
      setLiked(carId ? arr.includes(carId) : false);
    } catch (e) {}
  }, [carId]);
  async function toggle() {
    try {
      // Try API first; if it fails, fallback to localStorage for the mock frontend
      if (!liked && carId) {
        await api.post(`/buyer/favorites/${carId}`);
        setLiked(true);
      } else if (carId) {
        await api.delete(`/buyer/favorites/${carId}`);
        setLiked(false);
      }
    } catch (err) {
      // fallback: update localStorage
      try {
        const key = `favs:${slug}`;
        const raw = localStorage.getItem(key) || '[]';
        const arr = JSON.parse(raw);
        if (!liked && carId) {
          arr.push(carId);
          localStorage.setItem(key, JSON.stringify(arr));
          setLiked(true);
        } else if (carId) {
          const idx = arr.indexOf(carId);
          if (idx >= 0) arr.splice(idx, 1);
          localStorage.setItem(key, JSON.stringify(arr));
          setLiked(false);
        }
      } catch (e) {
        alert('Failed to favorite');
      }
    }
  }
  // `aria-pressed` removed to satisfy strict static parser rules; the aria-label updates reflect the state
  return (
    <button
      onClick={toggle}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      title={liked ? 'Remove from favorites' : 'Add to favorites'}
      className={`p-2 rounded ${liked ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
    >
      ❤
    </button>
  );
}
