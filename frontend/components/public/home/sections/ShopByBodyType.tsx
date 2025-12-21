'use client';

import React from 'react';
import Link from 'next/link';

interface ShopByBodyTypeProps {
  tenantSlug: string;
}

const BODY_TYPES = [
  { name: 'SUV', icon: '🚙', count: 320, description: 'Sport Utility Vehicles' },
  { name: 'Sedan', icon: '🚗', count: 280, description: 'Classic sedans' },
  { name: 'Hatchback', icon: '🚘', count: 150, description: 'Compact hatchbacks' },
  { name: 'Pickup', icon: '🛻', count: 95, description: 'Pickup trucks' },
  { name: 'Van', icon: '🚐', count: 65, description: 'Vans & minivans' },
  { name: 'Wagon', icon: '🚃', count: 45, description: 'Station wagons' },
  { name: 'Coupe', icon: '🏎️', count: 25, description: 'Sports coupes' },
  { name: 'Convertible', icon: '🚗', count: 12, description: 'Open-top cars' },
];

export default function ShopByBodyType({ tenantSlug }: ShopByBodyTypeProps) {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🚙 Shop by Body Type</h2>
            <p className="text-gray-600 mt-1">Find the perfect style for your needs</p>
          </div>
          <Link
            href={`/t/${tenantSlug}/stock`}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            All Types →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BODY_TYPES.map((type) => (
            <Link
              key={type.name}
              href={`/t/${tenantSlug}/stock?bodyType=${encodeURIComponent(type.name)}`}
              className="group bg-white hover:bg-[var(--accent)] border border-gray-200 hover:border-[var(--accent)] rounded-xl p-4 text-center transition-all shadow-sm hover:shadow-lg"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                {type.icon}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white text-sm transition-colors">
                {type.name}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">
                {type.count} cars
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
