import React from 'react';
import Link from 'next/link';
import { DealerCar } from '../../types/dealerCar';
import Carousel from '../Carousel';
import CarCard from '../CarCard.index';

export default function FeaturedStrip({ featured }: { featured: DealerCar[] }){
  if (!featured?.length) return null;
  return (
    <section className="my-6" aria-label="Featured Vehicles" role="region" aria-live="polite">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-3">Featured Vehicles</h3>
        <Link href="/dealer-template/stock" className="text-sm text-blue-600 hover:underline" aria-label="View all featured vehicles">View all</Link>
      </div>
      <Carousel
        items={featured}
        interval={3500}
        ariaLabel="Featured vehicles carousel"
        showArrows={true}
        showDots={true}
        renderItem={(c: DealerCar) => (
          <CarCard
            img={c.images?.[0]}
            alt={`${c.make} ${c.model} ${c.year ?? ''}`}
            tabIndex={0}
            name={`${c.make} ${c.model}`}
            year={c.year}
            price={c.currency === 'USD' ? c.price_usd : c.price_local_zmw}
            currency={c.currency === 'USD' ? 'USD' : 'ZMW'}
            desc={[c.transmission, c.fuel, c.bodyType].filter(Boolean).join(', ')}
            location={c.location || c.portOption}
            href={`/dealer-template/car/${c.id}`}
            certified={false}
          />
        )}
      />
    </section>
  );
}
