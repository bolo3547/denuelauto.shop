"use client";
import React, { useEffect, useState } from 'react';
import { cars } from '@/lib/tenantMock';

export default function AdminInspectionPage(){
  const [map, setMap] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    const r = await fetch('/api/inspection-report');
    const json = await r.json();
    setMap(json.map || {});
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  async function setReport(carId:string, url:string){
    await fetch('/api/inspection-report', { method: 'POST', body: JSON.stringify({ carId, url }), headers: {'Content-Type': 'application/json'} });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold">Inspection Reports (Admin)</h1>
      <div className="mt-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left"><th>Car</th><th>Report</th><th>Action</th></tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car.id} className="border-b">
                <td className="py-2">{car.make} {car.model}</td>
                <td>{map[car.id] ? <a href={map[car.id]} target="_blank" rel="noreferrer">View</a> : 'None'}</td>
                <td>
                  <input type="text" placeholder="https://.../report.pdf" className="px-2 py-1 border rounded" id={`report-${car.id}`} />
                  <button onClick={() => { const el = document.getElementById(`report-${car.id}`) as HTMLInputElement; setReport(car.id, el.value); }} className="ml-2 px-2 py-1 border rounded">Set</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
