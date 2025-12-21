"use client";
import api from '../utils/api';
import { useState } from 'react';

export default function PriceDropToggle({slug, carId}:{slug?:string, carId?:string}){
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  async function toggle(){
    setLoading(true);
    try{
      if(!subscribed){
        await api.post(`/t/${slug}/public/watchlist`, { carId });
        setSubscribed(true);
        try{
          const key = `watchlist:${slug}`;
          const raw = localStorage.getItem(key) || '[]';
          const arr = JSON.parse(raw);
          if(!arr.includes(carId)) arr.push(carId);
          localStorage.setItem(key, JSON.stringify(arr));
        }catch(e){}
      } else {
        // naive approach: no direct endpoint to delete by carId, rely on buyer API or list; skip delete
        alert('To unsubscribe, please go to your account or contact support');
      }
    }catch(err:any){
      alert('Failed to subscribe: '+(err?.response?.data?.error || err?.message));
    }finally{ setLoading(false); }
  }
  return (<button onClick={toggle} disabled={loading} className="px-3 py-1 rounded-md chip">{subscribed ? 'Subscribed' : 'Notify me'}</button>);
}
