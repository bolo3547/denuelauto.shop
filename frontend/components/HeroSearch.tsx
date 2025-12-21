"use client";
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function HeroSearch({slug}:{slug?:string}){
  const router = useRouter();
  const [q, setQ] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  return (
    <div className="bg-gradient-to-r from-primary via-white to-neutral-50 p-6 rounded-2xl shadow-md">
      <h2 className="text-white text-2xl font-semibold">Find Your Next Car</h2>
      <div className="mt-3 flex gap-3">
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="flex-1 p-2 rounded" placeholder="Make, Model or Keywords" />
        <button onClick={()=> router.push(`/t/${slug}/public/cars?search=${encodeURIComponent(q)}&minYear=${minYear}&maxYear=${maxYear}&minPrice=${minPrice}&maxPrice=${maxPrice}`)} className="btn-primary p-2 rounded">Search</button>
      </div>
      <div className="mt-3 flex gap-2 text-sm text-white opacity-90">
        <input value={minYear} onChange={(e)=>setMinYear(e.target.value)} placeholder="From Year" className="p-2 rounded bg-white text-black" />
        <input value={maxYear} onChange={(e)=>setMaxYear(e.target.value)} placeholder="To Year" className="p-2 rounded bg-white text-black" />
        <input value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} placeholder="Min Price" className="p-2 rounded bg-white text-black" />
        <input value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} placeholder="Max Price" className="p-2 rounded bg-white text-black" />
      </div>
    </div>
  );
}
