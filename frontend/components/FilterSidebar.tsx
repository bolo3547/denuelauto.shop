import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type StockFilters = {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  transmission?: string;
  fuel?: string;
  location?: string;
};

export default function FilterSidebar({ initial = {}, onChange }: { initial?: StockFilters; onChange?: (f: StockFilters) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qp = Object.fromEntries(searchParams ? Array.from(searchParams.entries()) : []);

  const [filters, setFilters] = React.useState<StockFilters>({ ...initial, ...qp } as any);

  const update = (patch: Partial<StockFilters>) => {
    const updated = { ...filters, ...patch } as StockFilters;
    setFilters(updated);
    onChange?.(updated);
  };

  const reset = () => {
    setFilters({});
    onChange?.({});
    // Update URL to clear query params
    if (typeof window !== 'undefined') {
      router.push(window.location.pathname);
    }
  };

  return (
    <aside className="w-full md:w-72 p-4 bg-card rounded-2xl border">
      <h4 className="font-semibold mb-3">Filters</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="filter-make" className="text-sm">Make</label>
          <input id="filter-make" value={filters.make || ''} onChange={e=>update({ make: e.target.value })} className="w-full p-2 mt-1 border rounded" placeholder="e.g. Toyota" />
        </div>
        <div>
          <label htmlFor="filter-model" className="text-sm">Model</label>
          <input id="filter-model" value={filters.model || ''} onChange={e=>update({ model: e.target.value })} className="w-full p-2 mt-1 border rounded" placeholder="e.g. Corolla" />
        </div>
        <div>
          <label className="text-sm">Year range</label>
          <div className="flex gap-2 mt-1">
            <input id="filter-minYear" type="number" value={filters.minYear ?? ''} onChange={e=>update({ minYear: Number(e.target.value) || undefined })} className="p-2 border rounded w-1/2" placeholder="From" />
            <input id="filter-maxYear" type="number" value={filters.maxYear ?? ''} onChange={e=>update({ maxYear: Number(e.target.value) || undefined })} className="p-2 border rounded w-1/2" placeholder="To" />
          </div>
        </div>
        <div>
          <label className="text-sm">Price (min - max)</label>
          <div className="flex gap-2 mt-1">
            <input id="filter-minPrice" type="number" value={filters.minPrice ?? ''} onChange={e=>update({ minPrice: Number(e.target.value) || undefined })} className="p-2 border rounded w-1/2" placeholder="Min" />
            <input id="filter-maxPrice" type="number" value={filters.maxPrice ?? ''} onChange={e=>update({ maxPrice: Number(e.target.value) || undefined })} className="p-2 border rounded w-1/2" placeholder="Max" />
          </div>
        </div>
        <div>
          <label htmlFor="bodyType" className="text-sm">Body type</label>
          <select
            id="bodyType"
            title="Body type"
            value={filters.bodyType || ''}
            onChange={e=>update({ bodyType: e.target.value || undefined })}
            className="w-full p-2 mt-1 border rounded"
          >
            <option value="">Any</option>
            <option>SUV</option>
            <option>Sedan</option>
            <option>Hatchback</option>
            <option>Truck</option>
          </select>
        </div>
        <div>
          <label htmlFor="transmission" className="text-sm">Transmission</label>
          <select
            id="transmission"
            title="Transmission"
            value={filters.transmission || ''}
            onChange={e=>update({ transmission: e.target.value || undefined })}
            className="w-full p-2 mt-1 border rounded"
          >
            <option value="">Any</option>
            <option>Automatic</option>
            <option>Manual</option>
          </select>
        </div>
        <div>
          <label htmlFor="fuel" className="text-sm">Fuel</label>
          <select id="fuel" title="Fuel" value={filters.fuel || ''} onChange={e=>update({ fuel: e.target.value || undefined })} className="w-full p-2 mt-1 border rounded">
            <option value="">Any</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-location" className="text-sm">Location</label>
          <input
            id="filter-location"
            value={filters.location || ''}
            onChange={e => update({ location: e.target.value })}
            className="w-full p-2 mt-1 border rounded"
            placeholder="Location"
            aria-label="Location"
          />
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                router.push(`${window.location.pathname}?${new URLSearchParams(filters as any).toString()}`);
              }
            }}
            className="btn-primary rounded px-3 py-2 text-sm"
          >Apply</button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => { router.push(`${window.location.pathname}?${new URLSearchParams(filters as any).toString()}`); }} className="btn-primary rounded px-3 py-2 text-sm">Apply</button>
          <button onClick={reset} className="rounded border px-3 py-2 text-sm">Reset</button>
        </div>
      </div>
    </aside>
  );
}
