import { useEffect, useState } from 'react';
import api, { normalizeCars } from 'utils/api';

export function useStock(slug: string, query: Record<string, any> = {}) {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(()=>{
    if(!slug) return;
    async function load(){
      setLoading(true);
      setError(null);
      try{
        const qs = new URLSearchParams(query as any).toString();
        const res = await api.get(`/t/${slug}/public/cars${qs ? `?${qs}`: ''}`);
        setCars(normalizeCars(res.data));
      }catch(err:any){
        setError(err);
        setCars([]);
      }finally{ setLoading(false); }
    }
    load();
  }, [slug, JSON.stringify(query)]);

  return { cars, loading, error };
}
