"use client";
import React, { useState } from 'react';
import api from '../utils/api';

export default function AppointmentModal({ slug, carId, onSuccess }: { slug?: string; carId?: string; onSuccess?: () => void }){
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(){
    if(!date) return alert('Please select a date and time');
    setLoading(true);
    try{
      await api.post(`/t/${slug}/public/appointments`, { carId, scheduledAt: date, name, phone });
      // store locally
      try{
        const key = `appointments:${slug}`;
        const raw = localStorage.getItem(key) || '[]';
        const arr = JSON.parse(raw);
        arr.unshift({ id: Date.now().toString(), date: date, name, phone, carId, createdAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
      }catch(e){}
      setOpen(false);
      onSuccess && onSuccess();
      alert('Appointment booked');
    }catch(err:any){
      alert('Failed: '+(err?.response?.data?.error || err?.message));
    }finally{ setLoading(false); }
  }

  return (
    <div>
      <button className="px-3 py-1 rounded border" onClick={() => setOpen(true)}>Book appointment</button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setOpen(false)}></div>
          <div className="bg-white p-4 rounded-lg z-10 max-w-md w-full">
            <h3 className="text-lg">Schedule an appointment</h3>
            <label htmlFor="appointment-datetime" className="block text-sm mt-2">Date & time</label>
            <input id="appointment-datetime" type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded" title="Appointment date and time" />
            <label htmlFor="appointment-name" className="block text-sm mt-2">Your name</label>
            <input id="appointment-name" className="w-full p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" title="Your full name" />
            <label htmlFor="appointment-phone" className="block text-sm mt-2">Phone</label>
            <input id="appointment-phone" className="w-full p-2 border rounded" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" title="Phone number" />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-1">Cancel</button>
              <button onClick={submit} disabled={loading} className="btn-primary px-3 py-1">Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
