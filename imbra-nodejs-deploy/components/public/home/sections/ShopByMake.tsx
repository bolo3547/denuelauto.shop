'use client';

import React from 'react';
import Link from 'next/link';
import { useTenantTheme } from '../../tenant';

interface ShopByMakeProps {
  tenantSlug: string;
}

// Make logos (placeholder SVGs or images)
const MAKES_DATA = [
  { name: 'Toyota', count: 450, logo: '🚗' },
  { name: 'Nissan', count: 280, logo: '🚙' },
  { name: 'Honda', count: 195, logo: '🚘' },
  { name: 'Mazda', count: 120, logo: '🚕' },
  { name: 'Mitsubishi', count: 98, logo: '🚐' },
  { name: 'Suzuki', count: 85, logo: '🚗' },
  { name: 'Hyundai', count: 76, logo: '🚙' },
  { name: 'Mercedes-Benz', count: 45, logo: '🚘' },
  { name: 'BMW', count: 38, logo: '🚕' },
  { name: 'Volkswagen', count: 32, logo: '🚐' },
  { name: 'Subaru', count: 28, logo: '🚗' },
  { name: 'Isuzu', count: 25, logo: '🚚' },
];

export default function ShopByMake({ tenantSlug }: ShopByMakeProps) {
  const { settings } = useTenantTheme();
  const featuredMakes = settings.homepageConfig?.featuredMakes;

  // Filter to featured makes if configured, otherwise show all
  const makes = featuredMakes
    ? MAKES_DATA.filter(m => featuredMakes.includes(m.name))
    : MAKES_DATA;

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🚗 Shop by Make</h2>
            <p className="text-gray-600 mt-1">Browse vehicles from top manufacturers</p>
          </div>
          <Link
            href={`/t/${tenantSlug}/stock`}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            All Makes →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {makes.map((make) => (
            <Link
              key={make.name}
              href={`/t/${tenantSlug}/stock?make=${encodeURIComponent(make.name)}`}
              className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-[var(--accent)] rounded-xl p-4 text-center transition-all"
            >
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-3xl">{make.logo}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{make.name}</h3>
              <p className="text-xs text-gray-500">{make.count} cars</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
