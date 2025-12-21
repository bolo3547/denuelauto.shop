"use client";
import { useState } from 'react';
import api from '../utils/api';

export default function SaveSearchModal({slug, query}:{slug?:string, query?:any}){
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const handleSave = async ()=>{
    try{
      await api.post(`/t/${slug}/public/saved-searches`, { query, email, phone });
      setOpen(false);
      alert('Saved search');
    }catch(err:any){ alert('Failed: '+(err?.response?.data?.error || err?.message)); }
  };
  return (<div>
    <button className="p-2 btn-primary text-white rounded" onClick={()=>setOpen(true)}>Save Search</button>
    {open && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-30" onClick={()=>setOpen(false)}></div>
        <div className="bg-white p-4 rounded z-10 max-w-md w-full">
          <h3>Save this Search</h3>
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="block w-full my-2 p-2 border" />
          <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} className="block w-full my-2 p-2 border" />
          <div className="flex gap-2 justify-end"><button onClick={()=> setOpen(false)} className="px-3 py-1">Cancel</button><button className="btn-primary px-3 py-1" onClick={handleSave}>Save</button></div>
        </div>
      </div>
    )}
  </div>);
}
