"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContainerTray({ slug }: { slug: string }) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('container_items') || '[]';
    setItems(JSON.parse(raw));
    const onStorage = () => setItems(JSON.parse(localStorage.getItem('container_items') || '[]'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  if (!items || items.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white shadow rounded">
      <div>Container: {items.length} item(s)</div>
      <div className="mt-2">
        <Link href={`/t/${slug}/export/estimator`}><a className="p-2 bg-primary text-white rounded">Open Estimator</a></Link>
      </div>
    </div>
  );
}
