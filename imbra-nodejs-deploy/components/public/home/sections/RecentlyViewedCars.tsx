'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHistory, FaArrowRight } from 'react-icons/fa';
import CarCard from '../../cards/CarCard';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel: string;
  images: string[];
}

interface RecentlyViewedCarsProps {
  tenantSlug: string;
}

export default function RecentlyViewedCars({ tenantSlug }: RecentlyViewedCarsProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        // Get viewed stock numbers from localStorage
        const storageKey = `denuel:recentlyViewed:${tenantSlug}`;
        const viewed = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];

        if (viewed.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch car data for these stock numbers
        const res = await fetch(`/api/t/${tenantSlug}/stock/batch-by-stockno`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockNos: viewed.slice(0, 12) }),
        });

        if (res.ok) {
          const data = await res.json();
          setCars(data.cars || []);
        }
      } catch (err) {
        console.error('Failed to fetch recently viewed cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [tenantSlug]);

  // Don't render if no recently viewed cars
  if (!loading && cars.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaHistory className="text-2xl text-gray-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600 text-sm">Cars you've looked at recently</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(`denuel:recentlyViewed:${tenantSlug}`);
              setCars([]);
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear History
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} tenantSlug={tenantSlug} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Helper function to add a car to recently viewed (call from car detail page)
export function addToRecentlyViewed(tenantSlug: string, stockNo: string) {
  if (typeof window === 'undefined') return;

  const storageKey = `denuel:recentlyViewed:${tenantSlug}`;
  const viewed = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];

  // Remove if already exists, then add to front
  const filtered = viewed.filter((s) => s !== stockNo);
  const updated = [stockNo, ...filtered].slice(0, 12);

  localStorage.setItem(storageKey, JSON.stringify(updated));
}
