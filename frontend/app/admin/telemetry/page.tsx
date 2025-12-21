"use client";
import React, { useEffect, useState } from 'react';

export default function AdminTelemetryPage(){
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/telemetry');
      const json = await r.json();
      setItems(json.telemetry || []);
    } catch(e) {
      setItems([]);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function clearAll(){
    if (!confirm('Clear all telemetry (demo)?')) return;
    await fetch('/api/telemetry', { method: 'DELETE' });
    load();
  }

  return (
    <div className={"max-w-6xl mx-auto py-6"}>
      <h1 className="text-2xl font-bold">Telemetry (Admin)</h1>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded border" onClick={load}>Refresh</button>
        <button className="px-3 py-2 rounded border text-red-600" onClick={clearAll}>Clear All</button>
      </div>
      <div className="mt-4">
        {loading && <div>Loading...</div>}
        {!loading && items.length === 0 && <div className="text-gray-600">No telemetry records</div>}
        {!loading && items.length > 0 && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b"><th>Time</th><th>Vehicle</th><th>Location</th><th>Speed</th><th>Battery</th></tr>
            </thead>
            <tbody>
              {items.map((it:any, idx:number)=>(
                <tr key={idx} className="border-b">
                  <td className="py-2">{it.timestamp}</td>
                  <td>{it.vehicleId}</td>
                  <td>{it.location?.lat?.toFixed?.(3)}, {it.location?.lng?.toFixed?.(3)}</td>
                  <td>{it.speedKph} kph</td>
                  <td>{it.batteryPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
