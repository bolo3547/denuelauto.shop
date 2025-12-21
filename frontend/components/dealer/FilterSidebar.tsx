'use client';

import React, { useState, useMemo } from 'react';
import { DealerCar } from '../../types/dealerCar';

export default function FilterSidebar({ cars, onApply }: { cars: DealerCar[]; onApply: (filters: any) => void }){
  const makes = useMemo(() => Array.from(new Set(cars.map(c => c.make))), [cars]);
  const models = useMemo(() => Array.from(new Set(cars.map(c => c.model))), [cars]);
  const transmissions = useMemo(() => Array.from(new Set(cars.map(c => c.transmission))), [cars]);
  const fuels = useMemo(() => Array.from(new Set(cars.map(c => c.fuel))), [cars]);
  const statuses = useMemo(() => Array.from(new Set(cars.map(c => c.status))), [cars]);
  const bodyTypes = useMemo(() => Array.from(new Set(cars.map(c => c.bodyType).filter(Boolean))), [cars]);
  const colors = useMemo(() => Array.from(new Set(cars.map(c => c.color).filter(Boolean))), [cars]);

  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [transmission, setTransmission] = useState<string>('');
  const [fuel, setFuel] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [bodyType, setBodyType] = useState<string>('');
  const [color, setColor] = useState<string>('');

  function apply(){
    onApply({ make, model, minYear, maxYear, maxPrice, transmission, fuel, status, bodyType, color });
  }

  return (
    <div>
      <h4 className="font-semibold mb-3">Filters</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="filter-make" className="block text-sm font-medium mb-1">Make</label>
          <select id="filter-make" value={make} onChange={(e)=>setMake(e.target.value)} className="w-full border p-2 rounded" aria-label="Make">
            <option value="">All makes</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-model" className="block text-sm font-medium mb-1">Model</label>
          <select id="filter-model" value={model} onChange={(e)=>setModel(e.target.value)} className="w-full border p-2 rounded" aria-label="Model">
            <option value="">All models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-minYear" className="block text-sm font-medium mb-1">Min Year</label>
          <input id="filter-minYear" type="number" value={minYear} onChange={e=>setMinYear(Number(e.target.value)||'')} className="w-full border p-2 rounded" placeholder="Min year" />
        </div>
        <div>
          <label htmlFor="filter-maxYear" className="block text-sm font-medium mb-1">Max Year</label>
          <input id="filter-maxYear" type="number" value={maxYear} onChange={e=>setMaxYear(Number(e.target.value)||'')} className="w-full border p-2 rounded" placeholder="Max year" />
        </div>
        <div>
          <label htmlFor="filter-maxPrice" className="block text-sm font-medium mb-1">Max Price (USD)</label>
          <input id="filter-maxPrice" type="number" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value)||'')} className="w-full border p-2 rounded" placeholder="Max price" />
        </div>
        <div>
          <label htmlFor="filter-transmission" className="block text-sm font-medium mb-1">Transmission</label>
          <select id="filter-transmission" value={transmission} onChange={(e)=>setTransmission(e.target.value)} className="w-full border p-2 rounded" aria-label="Transmission">
            <option value="">All</option>
            {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-fuel" className="block text-sm font-medium mb-1">Fuel</label>
          <select id="filter-fuel" value={fuel} onChange={(e)=>setFuel(e.target.value)} className="w-full border p-2 rounded" aria-label="Fuel">
            <option value="">All</option>
            {fuels.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium mb-1">Status</label>
          <select id="filter-status" value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full border p-2 rounded" aria-label="Status">
            <option value="">All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-bodyType" className="block text-sm font-medium mb-1">Body Type</label>
          <select id="filter-bodyType" value={bodyType} onChange={(e)=>setBodyType(e.target.value)} className="w-full border p-2 rounded" aria-label="Body Type">
            <option value="">All</option>
            {bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-color" className="block text-sm font-medium mb-1">Color</label>
          <select id="filter-color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-full border p-2 rounded" aria-label="Color">
            <option value="">All</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={apply} className="w-full px-4 py-2 bg-blue-600 text-white rounded">Apply Filters</button>
      </div>
    </div>
  );
}