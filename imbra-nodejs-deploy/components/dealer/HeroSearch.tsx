'use client';

import React, { useState, useMemo } from 'react';
import { DealerCar } from '../../types/dealerCar';

export default function HeroSearch({ cars, onSearch }: { cars: DealerCar[]; onSearch: (filters: any) => void }){
  const makes = useMemo(() => Array.from(new Set(cars.map(c => c.make))), [cars]);
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [transmission, setTransmission] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  function submit(e?: React.FormEvent){
    if (e) e.preventDefault();
    onSearch({ make, model, minYear, maxYear, transmission, maxPrice });
  }

  return (
    <form className="bg-white p-4 border rounded shadow-sm" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-2">
        <select value={make} onChange={(e)=>setMake(e.target.value)} className="border p-2 rounded" aria-label="Car make" title="Car make">
          <option value="">All makes</option>
          {makes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input value={model} onChange={(e)=>setModel(e.target.value)} placeholder="Model" className="border p-2 rounded" />
        <input type="number" value={minYear} onChange={e=>setMinYear(Number(e.target.value)||'')} placeholder="Min year" className="border p-2 rounded" />
        <input type="number" value={maxYear} onChange={e=>setMaxYear(Number(e.target.value)||'')} placeholder="Max year" className="border p-2 rounded" />
        <select value={transmission} onChange={e=>setTransmission(e.target.value)} className="border p-2 rounded" aria-label="Transmission" title="Transmission">
          <option value="">Any Transmission</option>
          <option value="AT">AT</option>
          <option value="MT">MT</option>
        </select>
        <input type="number" className="border p-2 rounded" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value)||'')} placeholder="Max price" />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
        <button type="button" onClick={()=>{ setMake(''); setModel(''); setMinYear(''); setMaxYear(''); setTransmission(''); setMaxPrice(''); onSearch({}); }} className="px-4 py-2 border rounded">Reset</button>
      </div>
    </form>
  );
}
