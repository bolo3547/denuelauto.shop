"use client";
import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';

export default function LeadCaptureModal({ open, onClose, context }:{open:boolean,onClose:()=>void,context?:string}){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [loading,setLoading] = useState(false);

  if(!open) return null;

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    const utm = (()=>{ try{ return JSON.parse(localStorage.getItem('utm_params')||'null'); }catch(e){return null;} })();
    const payload = { name, email, phone, context, utm, createdAt: new Date().toISOString() };
    try{
      // try POSTing to API if available
      await fetch('/api/leads', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
    }catch(e){
      // fallback to localStorage
      const key = 'local_leads';
      const raw = localStorage.getItem(key) || '[]';
      const arr = JSON.parse(raw);
      arr.unshift(payload);
      localStorage.setItem(key, JSON.stringify(arr));
    }
    trackEvent('lead_captured', { context, hasUtm: !!utm });
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden></div>
      <form onSubmit={submit} className="relative bg-white rounded-lg p-6 w-full max-w-md z-80">
        <h3 className="text-lg font-semibold mb-2">Request a quote</h3>
        <p className="text-sm text-slate-600 mb-4">Enter your details and we'll get back to you.</p>
        <input className="w-full mb-2 p-2 border rounded" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
        <input className="w-full mb-2 p-2 border rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full mb-2 p-2 border rounded" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
        </div>
      </form>
    </div>
  );
}
