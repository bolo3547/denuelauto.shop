"use client";
import React, { useEffect, useState } from 'react';

export default function AdminOtAPage(){
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [version, setVersion] = useState('1.0.1');
  const [notes, setNotes] = useState('');

  async function load(){
    const r = await fetch('/api/ota/push');
    const json = await r.json();
    setLogs(json.ota || []);
  }

  useEffect(()=>{ load(); }, []);

  async function pushOTA(){
    await fetch('/api/ota/push', { method: 'POST', body: JSON.stringify({ vehicleId, version, notes }), headers: {'Content-Type': 'application/json'} });
    setVehicleId(''); setNotes('');
    load();
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold">OTA Push (Admin)</h1>
      <div className="mt-4 flex gap-2">
        <input className="px-2 py-1 border rounded" placeholder="Vehicle ID" value={vehicleId} onChange={(e)=>setVehicleId(e.target.value)} />
        <input className="px-2 py-1 border rounded" placeholder="Version" value={version} onChange={(e)=>setVersion(e.target.value)} />
        <input className="px-2 py-1 border rounded flex-1" placeholder="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} />
        <button onClick={pushOTA} className="px-3 py-1 border rounded bg-blue-600 text-white">Push</button>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">History</h3>
        <div className="mt-2">
          {logs.map(l=> (
            <div key={l.id} className="border p-3 mb-2">
              <div className="text-sm">{l.timestamp} • Vehicle: {l.vehicleId} • Version: {l.version}</div>
              <div className="text-xs text-gray-600 mt-1">{l.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
