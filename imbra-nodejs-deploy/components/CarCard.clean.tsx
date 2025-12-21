"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Car } from '@/types/car';
import { useTenantTheme } from '@/contexts/TenantThemeContext';
import { useFavorites } from '@/hooks/useFavorites';
import useCompare from '@/hooks/useCompare';

type Props = {
  img?: string;
  name?: string;
  year?: number | string;
  price?: number | string;
  currency?: string;
  desc?: string;
  location?: string;
  href?: string;
  onViewDetails?: () => void;
  certified?: boolean;
  alt?: string;
  tabIndex?: number;
  car?: Car;
  slug?: string;
};

export default function CarCardClean({ img, name, year, price, currency, desc, location, href, onViewDetails, certified = false, alt, tabIndex, car, slug }: Props) {
  const { theme: tenantTheme } = useTenantTheme();
  const tone = (tenantTheme?.brandTone || 'professional') as string;
  const tenantSlug = slug ?? 'global';
  const safeId = car?.id ?? (car as any)?.stockNo ?? '';
  const targetHref = href || (slug && safeId ? `/t/${slug}/public/cars/${safeId}` : '#');

  const favHooks = car ? useFavorites(tenantSlug) : null;
  const compHooks = car ? useCompare(tenantSlug) : null;
  const isFav = car && favHooks ? !!favHooks.favorites.find((i: any) => (typeof i === 'string' ? i === car.id : i?.id === car.id)) : false;
  const isComp = car && compHooks && safeId ? compHooks.isInCompare(safeId) : false;

  if (car) {
    const anyCar = car as any;
    img = img || car.images?.[0] || anyCar.main_image_url || img;
    name = name || `${car.make} ${car.model}`;
    year = year || car.year;
    // Support legacy and current price fields (snake_case and camelCase)
    price = price || (anyCar.priceLocal ?? anyCar.price_local_zmw ?? anyCar.priceUsd ?? anyCar.price_usd ?? anyCar.priceLocalZmw ?? anyCar.priceLocal);
    currency = currency || (anyCar.priceLocal || anyCar.price_local_zmw ? 'ZMW' : (anyCar.priceUsd || anyCar.price_usd ? 'USD' : currency));
    desc = desc || [anyCar.transmission, anyCar.fuel, anyCar.drive].filter(Boolean).join(', ');
    location = location || anyCar.location || anyCar.portOption || '';
    certified = certified || !!anyCar.certified;
  }

  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const formattedPrice = typeof price === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(price)
    : price;

  const viewLabel = tone === 'formal' ? 'View Details' : tone === 'friendly' ? 'See Details' : 'View';
  const enquireLabel = tone === 'formal' ? 'Enquire' : tone === 'friendly' ? 'Message Us' : 'Enquire';

  return (
    <article role="group" aria-roledescription="vehicle card" tabIndex={tabIndex} className="relative min-w-[260px] bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col items-start hover:scale-105 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F3D91] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0F3D91]">
      {certified && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">Certified</span>
        </div>
      )}

      <div className="w-full flex items-center justify-center overflow-hidden rounded-xl mb-4 bg-gray-50">
        <Image src={img || '/cars/car-placeholder.jpg'} alt={alt || name || 'Vehicle'} width={400} height={224} className="object-cover w-full h-36" />
      </div>

      <div className="flex-1 w-full">
        <h3 data-testid="car-title" className="text-lg font-bold text-[#0F3D91]">{name}</h3>
        <div className="text-gray-600 text-sm mt-1">{year ?? ''}</div>
        {desc && (
          <div className="mt-2 flex flex-wrap gap-2">
            {desc.split(',').map((d) => d.trim()).filter(d => d && String(year) !== d).map((d, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{d}</span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span data-testid="car-price" className="text-[#FFD700] font-bold text-lg">{formattedPrice}</span>
          <span className="text-xs text-gray-500">{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={targetHref} onClick={(e) => { e.preventDefault(); setOpen(true); if (onViewDetails) onViewDetails(); }} className="px-4 py-2 rounded-lg bg-[#0F3D91] text-white font-semibold hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200" data-testid="car-view-details">{viewLabel}</Link>
          <button data-testid="car-enquire" onClick={onViewDetails} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150">{enquireLabel}</button>
          {car && favHooks && (
            <button onClick={() => isFav ? favHooks.removeFavorite(car.id as string) : favHooks.addFavorite(car.id as string)} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'} className={`px-3 py-1 rounded border ${isFav ? 'text-red-600' : ''}`} title={isFav ? 'Remove from favorites' : 'Add to favorites'}>❤️</button>
          )}
          {car && compHooks && (
            <button
              onClick={() => {
                if (!safeId) return;
                if (isComp) {
                  compHooks.removeFromCompare(safeId);
                } else {
                  compHooks.addToCompare(safeId);
                }
              }}
              aria-label={isComp ? 'Remove from compare' : 'Add to compare'}
              className={`px-3 py-1 rounded border ${isComp ? 'text-blue-600' : ''}`}
            >
              Compare
            </button>
          )}
        </div>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" data-testid="car-quickview">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4">
            <div className="flex gap-6">
              <div className="w-2/5">
                <Image src={img || '/cars/car-placeholder.jpg'} alt={alt || name || 'Vehicle'} width={600} height={360} className="rounded-lg object-cover w-full h-56" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-2xl font-bold">{name}</h3>
                    <div className="text-sm text-gray-500 mt-1">{location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#FFD700] font-bold text-lg">{formattedPrice}</div>
                    {certified && <div className="text-xs text-green-600 mt-1">Certified Vehicle</div>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-700">{desc}</div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href={targetHref} className="px-4 py-2 rounded-lg bg-[#0F3D91] text-white font-semibold hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200">View Full Details</Link>
                  <button onClick={() => { if (onViewDetails) onViewDetails(); }} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Enquire</button>
                  <button onClick={() => router.push(`/checkout/${encodeURIComponent(safeId)}`)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200">Buy Now</button>
                </div>
              </div>
            </div>
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>
      )}
    </article>
  );
}
