import axios from 'axios';
import { normalizeCars } from '../../../../../utils/api';
import { Car } from '../../../../../types/car';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { makeApiUrl } from '@/lib/config/api';
import HeroSearch from '../../../../../components/HeroSearch';
import CarCard from '../../../../../components/CarCard.index';
import SaveSearchModal from '../../../../../components/SaveSearchModal';
import FilterSidebar from '../../../../../components/FilterSidebar';
import WhatsAppButton from '../../../../../components/WhatsAppButton';
import SeoTags from '../../../../../components/SeoTags';
import type { StockFilters } from '../../../../../components/FilterSidebar';

export default function Catalog({ initialCars }: { initialCars?: Car[] }) {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const [cars, setCars] = useState<Car[]>(normalizeCars(initialCars));
  // Define initialFilters based on your filter structure, here as an empty object
  const initialFilters: StockFilters = {};

  useEffect(() => {
    if (!slug) return;
    const q = router.query || {};
    axios
      .get(makeApiUrl(`/t/${slug}/public/cars`), { params: q })
      .then((r) => setCars(normalizeCars(r.data)))
      .catch(() => setCars([]));
  }, [slug, router.query]);

  return (
    <div className="p-4">
      <SeoTags title={`Inventory | ${slug}`} description={`Catalog for ${slug}`} />
      <div className="mb-6 flex items-center justify-between">
        <HeroSearch slug={slug} />
        <div className="ml-4"><SaveSearchModal slug={slug} query={router.query} /></div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="p-3 rounded-2xl bg-white shadow-sm">
            <FilterSidebar
              initial={initialFilters}
              onChange={(filters) => {
                router.push({
                  pathname: `/t/${slug}/public/cars`,
                  query: { ...filters },
                }, undefined, { shallow: true });
              }}
            />
          </div>
        </div>
        <div className="col-span-9">
          <div className="grid grid-cols-3 gap-4">
            {cars.map((c) => (<CarCard key={c.id} car={c} slug={slug} />))}
          </div>
        </div>
      </div>
      <WhatsAppButton phone={slug ? '123456789' : ''} message={`Inquiring about ${slug}`} />
    </div>
  );
}

// Converted to client-side rendering: data is fetched in the component
