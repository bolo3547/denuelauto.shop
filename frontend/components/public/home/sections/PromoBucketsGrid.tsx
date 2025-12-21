'use client';

import React from 'react';
import Link from 'next/link';
import { useTenantTheme } from '../../tenant';

interface PromoBucket {
  id: string;
  label: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface PromoBucketsGridProps {
  tenantSlug: string;
}

// Default promo buckets if not configured
const DEFAULT_PROMO_BUCKETS: PromoBucket[] = [
  { id: '1', label: '70%+ Off', slug: '70-off', icon: '🔥', color: 'bg-red-600' },
  { id: '2', label: '60%+ Off', slug: '60-off', icon: '💥', color: 'bg-orange-600' },
  { id: '3', label: '50%+ Off', slug: '50-off', icon: '⚡', color: 'bg-yellow-600' },
  { id: '4', label: '40%+ Off', slug: '40-off', icon: '✨', color: 'bg-green-600' },
  { id: '5', label: '30%+ Off', slug: '30-off', icon: '💫', color: 'bg-teal-600' },
  { id: '6', label: '1-30% Off', slug: '1-30-off', icon: '🏷️', color: 'bg-blue-600' },
  { id: '7', label: 'Best Deals', slug: 'best-deals', icon: '🌟', color: 'bg-purple-600' },
  { id: '8', label: 'Under K150k', slug: 'under-150k', icon: '💰', color: 'bg-emerald-600' },
  { id: '9', label: 'Under K300k', slug: 'under-300k', icon: '💵', color: 'bg-cyan-600' },
  { id: '10', label: 'Clearance', slug: 'clearance', icon: '🏁', color: 'bg-pink-600' },
];

export default function PromoBucketsGrid({ tenantSlug }: PromoBucketsGridProps) {
  const { settings } = useTenantTheme();
  const buckets = settings.homepageConfig?.promoBuckets || DEFAULT_PROMO_BUCKETS;

  return (
    <section className="py-8 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">🏷️ Shop By Discount</h2>
          <Link
            href={`/t/${tenantSlug}/stock`}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View All Deals →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {buckets.map((bucket) => (
            <Link
              key={bucket.id}
              href={`/t/${tenantSlug}/stock?promo=${bucket.slug}`}
              className={`${bucket.color || 'bg-gray-700'} text-white rounded-xl p-3 text-center hover:opacity-90 hover:scale-105 transition-all shadow-md`}
            >
              <div className="text-2xl mb-1">{bucket.icon || '🏷️'}</div>
              <div className="text-xs font-semibold leading-tight">{bucket.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
