"use client";
import { useEffect } from 'react';

function parseUtm(search: string){
  try{
    const params = new URLSearchParams(search);
    const utm:any = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>{
      const v = params.get(k);
      if(v) utm[k] = v;
    });
    return Object.keys(utm).length ? utm : null;
  }catch(e){ return null; }
}

export default function UTMTracker(){
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    try{
      const existing = localStorage.getItem('utm_params');
      if (existing) return; // only capture once per browser/session
      const utm = parseUtm(window.location.search || window.location.hash || '');
      if (utm) localStorage.setItem('utm_params', JSON.stringify(utm));
    }catch(e){ /* ignore */ }
  }, []);

  return null;
}
