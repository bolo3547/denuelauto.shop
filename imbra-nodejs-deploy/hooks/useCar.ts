import { useEffect, useState } from 'react';
import api from 'utils/api';

export function useCar(slug?: string, stockNo?: string | number) {
  const [car, setCar] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(()=>{
    if(!slug || !stockNo) return;
    async function load(){
      setLoading(true);
      try{
        const res = await api.get(`/t/${slug}/public/cars/${stockNo}`);
        if(res.status === 200) setCar(res.data);
      }catch(err){ setError(err); setCar(null); }
      finally{ setLoading(false); }
    }
    load();
  }, [slug, stockNo]);
  return { car, loading, error };
}
