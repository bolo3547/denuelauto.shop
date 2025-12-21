import { useEffect, useState } from 'react';
import api from 'utils/api';

export function useTenant(slug?: string) {
  const [tenant, setTenant] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(()=>{
    if(!slug) return;
    async function load(){
      setLoading(true);
      try{
        const r = await api.get(`/api/tenants/${slug}`);
        if(r.status === 200) setTenant(r.data);
      }catch(err){ setError(err); setTenant(null); }
      finally{ setLoading(false); }
    }
    load();
  }, [slug]);
  return { tenant, loading, error };
}
