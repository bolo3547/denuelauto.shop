import { useState } from 'react';
import api from 'utils/api';

export function useCifCalculator(slug: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<any>(null);

  async function calculate(payload: { price: number; port?: string; freight?: number; insurancePercent?: number }){
    setLoading(true);
    setError(null);
    try{
      // call our Next.js API route which is a front-end placeholder that will be wired to backend
      const res = await api.post(`/api/t/${slug}/cif`, payload);
      setResult(res.data);
      return res.data;
    }catch(err){ setError(err); return null; }
    finally{ setLoading(false); }
  }
  return { calculate, loading, result, error };
}
