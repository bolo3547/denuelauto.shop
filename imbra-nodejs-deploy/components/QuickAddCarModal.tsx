"use client";
import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';

export default function QuickAddCarModal({ open, onClose }:{open:boolean,onClose:()=>void}){
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);

  if(!open) return null;

  async function handleImport(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    try{
      const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ csv }) });
      const body = await res.json();
      if(res.ok){
        setMessage(`Imported ${body.imported} rows`);
        trackEvent('admin_import', { count: body.imported });
      } else {
        setMessage(body.error || 'Import failed');
      }
    }catch(err:any){ setMessage(err?.message || 'Network error'); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden></div>
      <form onSubmit={handleImport} className="relative bg-white rounded-lg p-6 w-full max-w-2xl z-80">
        <h3 className="text-lg font-semibold mb-2">Quick Add Cars (CSV)</h3>
        <p className="text-sm text-slate-600 mb-4">Paste CSV (header row) with columns like make,model,year,price_usd,stockNo</p>
        <textarea value={csv} onChange={(e)=>setCsv(e.target.value)} className="w-full h-48 p-2 border rounded" placeholder="make,model,year,price_usd,stockNo\nToyota,Corolla,2018,12000,STK001"></textarea>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Close</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>{loading ? 'Importing…' : 'Import'}</button>
        </div>
        {message && <div className="mt-3 text-sm text-slate-700">{message}</div>}
      </form>
    </div>
  );
}
