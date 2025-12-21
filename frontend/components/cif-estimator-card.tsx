import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCifCalculator } from '@/hooks/useCifCalculator';

export default function CifEstimatorCard(){
  const router = useRouter();
  const params = useParams() as any;
  const slug = params?.slug || 'sample-dealer';
  const { calculate, loading, result } = useCifCalculator(slug);
  const [price, setPrice] = useState('');
  const [port, setPort] = useState('Dar es Salaam');

  const onEstimate = async () => {
    await calculate({ price: Number(price || 0), port });
  };
  return (
    <div className="bg-card p-4 rounded-2xl shadow border">
      <h4 className="font-semibold">CIF Estimator</h4>
      <div className="mt-2 text-sm">Choose port and enter price to estimate CIF, duty & fees.</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <label className="sr-only" htmlFor="port-select">Port</label>
        <select id="port-select" aria-label="Port" title="Port" className="p-3 rounded-2xl border" value={port} onChange={e=>setPort(e.target.value)}>
          <option>Dar es Salaam</option>
          <option>Durban</option>
          <option>Walvis Bay</option>
        </select>
        <input className="p-3 rounded-2xl border" placeholder="Price (USD)" value={price} onChange={e=>setPrice(e.target.value)} />
        <div className="flex items-center gap-2">
          <button onClick={onEstimate} disabled={loading} className="btn-primary px-3 py-2 rounded text-sm text-white">Estimate</button>
          <div className="text-xs text-gray-600">Estimated CIF: <strong>{result?.data?.total ? `$${Number(result.data.total).toFixed(2)}` : '$0'}</strong></div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">Full duty breakdown via SMS</div>
    </div>
  );
}
