 "use client";
import { useState } from 'react';
import api from '../utils/api';

export default function InquiryModal({slug, carId, onSuccess}:{slug?:string, carId?:string, onSuccess?:()=>void}){
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  async function submit(){
    try{
      await api.post(`/t/${slug}/public/cars/inquiry`, { name, email, phone, message, carId });
      // persist locally for account enquiries view
      try{
        const key = `enquiries:${slug}`;
        const raw = localStorage.getItem(key) || '[]';
        const arr = JSON.parse(raw);
        arr.unshift({ id: Date.now().toString(), name, email, phone, message, carId, createdAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
      }catch(e){}
      setOpen(false);
      onSuccess && onSuccess();
      alert('Inquiry sent');
    }catch(err:any){ alert('Failed: '+(err?.response?.data?.error || err?.message)); }
  }
  return (
    <div>
      <button onClick={() => setOpen(true)} className="btn-primary p-2 rounded text-white">Get Quote</button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setOpen(false)}></div>
          <div className="bg-white p-4 rounded-lg z-10 max-w-md w-full">
            <h3 className="text-lg">Inquiry</h3>
            <input placeholder="Name" className="block w-full border p-2 my-2" value={name} onChange={(e)=>setName(e.target.value)} />
            <input placeholder="Email" className="block w-full border p-2 my-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input placeholder="Phone" className="block w-full border p-2 my-2" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <textarea placeholder="Message" className="block w-full border p-2 my-2" value={message} onChange={(e)=>setMessage(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="btn-primary px-3 py-1" onClick={()=>submit()}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
