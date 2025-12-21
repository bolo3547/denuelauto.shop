import Image from 'next/image';
import React from 'react';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';
import { Car } from '../types/car';
import { useTenantTheme } from '@/contexts/TenantThemeContext';

export default function CarCard({ car, slug }: { car: Car, slug?: string }){
  const keyId = car.id ?? car.stockNo ?? (car as any).stock ?? '';
    const safeId = car.id ?? (car as any).stockNo ?? (car as any).vin ?? '';
    const carHref = slug && safeId ? `/t/${slug}/public/cars/${safeId}` : '#';
  const thumbSrc = typeof (car as any).thumb === 'string' && (car as any).thumb ? (car as any).thumb : '/cars/placeholder.svg';
  const { theme } = useTenantTheme();
  const waPhone = (theme?.whatsapp || (car as any).whatsapp || '').replace(/\D/g, '') || '';
  const waText = encodeURIComponent(`Hi, I'm interested in ${car.make} ${car.model} (Stock ${car.stockNo}). Is it still available?`);
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : '#';
  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
      <div className="relative h-44 w-full">
        <Image src={thumbSrc} alt={`${car.make} ${car.model}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 33vw"/>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{car.year} {car.make} {car.model}</h3>
        <div className="text-sm text-gray-500 mt-1">Stock: {String(car.stockNo ?? (car as any).stock ?? '')}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">{String(car.transmission ?? 'Auto')} - {String(car.fuel ?? 'Petrol')}</div>
          <div className="text-xl font-bold">{typeof (car as any).priceZmw === 'number' ? `${(car as any).priceZmw.toLocaleString()} ZMW` : typeof (car as any).priceUsd === 'number' ? `$${(car as any).priceUsd}` : '—'}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <a href={carHref} className="text-sm border px-3 py-2 rounded-2xl">Details</a>
          <a href={carHref} className="text-sm px-3 py-2 rounded-2xl bg-[var(--accent)] text-white">Reserve</a>
          <FavoriteButton carId={safeId || undefined} slug={slug} />
          <CompareButton carId={safeId || undefined} slug={slug} />
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 border rounded-full text-sm">WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
