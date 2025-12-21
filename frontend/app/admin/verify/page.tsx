"use client";
import React, { useEffect, useState } from 'react';
import { cars } from '@/lib/tenantMock';

export default function AdminVerifyPage(){
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/verify-owner');
      const json = await r.json();
      const map = json.verifiedMap || {};
      setList(cars.map(c => ({ ...c, verified: !!map[c.vin] })));
    } catch(e) { setList(cars.map(c => ({ ...c, verified: false }))); }
    setLoading(false);
  }

  useEffect(()=> { load(); }, []);

  async function toggle(c: any) {
    const setVerified = !c.verified;
    await fetch('/api/verify-owner', { method: 'POST', body: JSON.stringify({ vin: c.vin, setVerified }), headers: {'Content-Type': 'application/json'} });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold">Ownership Verification (Admin)</h1>
      <div className="mt-4">
        {loading && <div>Loading...</div>}
        {!loading && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b"><th>VIN</th><th>Car</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {list.map(l=> (
                <tr key={l.id} className="border-b">
                  <td className="py-2">{l.vin}</td>
                  <td>{l.make} {l.model}</td>
                  <td>{l.verified ? 'Verified': 'Unverified'}</td>
                  <td><button className="px-3 py-1 rounded border" onClick={()=> toggle(l)}>{l.verified ? 'Unverify' : 'Verify'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
