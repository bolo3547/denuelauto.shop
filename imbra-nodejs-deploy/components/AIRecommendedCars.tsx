'use client';

import React from 'react';
import CarCard from './CarCard.index';

export default function AIRecommendedCars({ cars = [] }: { cars?: any[] }) {
  // Mock logic: just return provided cars or empty
  if (!cars.length) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Recommended for you</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cars.map(c => <CarCard key={c.id} car={c} />)}
      </div>
    </div>
  );
}
