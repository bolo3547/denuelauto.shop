'use client';

import { useState } from 'react';

export default function AddToContainerButton({ carId }: { carId?: string }) {
  const [added, setAdded] = useState<boolean>(() => typeof window !== 'undefined' && !!(carId && localStorage.getItem(`container_${carId}`)));
  const add = () => {
    if (!carId) return;
    const key = 'container_items';
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : '[]';
    const items = raw ? JSON.parse(raw) : [];
    if (!items.includes(carId)) items.push(carId);
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(items));
    setAdded(true);
  };
  const remove = () => {
    if (!carId) return;
    const key = 'container_items';
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : '[]';
    const items = raw ? JSON.parse(raw) : [];
    const filtered = items.filter((id: string) => id !== carId);
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(filtered));
    setAdded(false);
  };
  return (
    <button className={`p-2 rounded ${added ? 'bg-gray-400' : 'bg-primary text-white'}`} onClick={() => (added ? remove() : add())}>{added ? 'Added to Container' : 'Add to Container'}</button>
  );
}
