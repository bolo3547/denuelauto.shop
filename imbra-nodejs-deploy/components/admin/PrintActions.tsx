"use client";
import React, { useState } from 'react';

export default function PrintActions(){
  const [loading, setLoading] = useState(false);

  async function downloadProforma(){
    try{
      setLoading(true);
      const res = await fetch('/api/admin/print?text=' + encodeURIComponent('Proforma Invoice - Denuel Auto'));
      if(!res.ok) throw new Error('Failed to generate');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proforma.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }catch(err:any){
      alert('Error generating PDF: ' + (err?.message || err));
    }finally{ setLoading(false); }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button onClick={downloadProforma} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? 'Generating…' : 'Generate Proforma (PDF)'}
      </button>
      <a href="/api/admin/print?text=Sample" className="px-4 py-2 border rounded bg-white text-slate-800">Open in new tab</a>
    </div>
  );
}
