"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { cars as carsMock } from '../lib/tenantMock';

export default function SearchBox(){
  const [q,setQ] = useState('');
  const results = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return [];
    return carsMock.filter((c:any)=>`${c.make} ${c.model} ${c.year} ${c.stockNo}`.toLowerCase().includes(term)).slice(0,8);
  },[q]);

  return (
    <div className="relative">
      <input aria-label="Search stock" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search cars, e.g. Toyota Land Cruiser" className="border rounded px-3 py-2 w-72" />
      {results.length>0 && (
        <div className="absolute left-0 mt-1 w-72 bg-white border rounded shadow z-50">
          {results.map((r:any)=> (
            <Link key={r.id} href={`/t/demo/public/cars/${r.id}`} className="block p-2 hover:bg-slate-50">{r.year} {r.make} {r.model} — {r.stockNo}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
