import React from 'react';

export default function FilterBar(){
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="body-type" className="sr-only">Body type</label>
      <select id="body-type" aria-label="Body type" title="Body type" className="p-3 rounded-2xl border">
        <option value="all">All</option>
        <option value="suv">SUV</option>
        <option value="sedan">Sedan</option>
        <option value="hatchback">Hatchback</option>
        <option value="van">Van</option>
        <option value="truck">Truck</option>
      </select>
      <input className="p-3 rounded-2xl border" placeholder="Min price" />
      <input className="p-3 rounded-2xl border" placeholder="Max price" />
      <button className="px-4 py-2 rounded-2xl bg-primary text-white">Apply</button>
    </div>
  );
}
