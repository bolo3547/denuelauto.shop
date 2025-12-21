"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cars } from '../../../../lib/tenantMock';
import TrustBadge from '@/components/TrustBadge';
import InspectionReport from '@/components/InspectionReport';
import { generateTelemetry } from '@/lib/telemetryMock';

export default function ClientCarDetail() {
  const params = useParams() as any;
  const id = params?.id;
  const car = cars.find((c: any) => String(c.id) === String(id));
  const [latestTelemetry, setLatestTelemetry] = useState<any | null>(null);
  const [ownerVerified, setOwnerVerified] = useState<boolean | null>(null);

  if (!car) return <div className="max-w-4xl mx-auto py-12"> <h2>Car not found</h2></div>;

  useEffect(() => {
    if (!car) return;
    let active = true;
    async function postTelemetry() {
      const t = generateTelemetry(String(id));
      try {
        await fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(t), headers: { 'Content-Type': 'application/json' } });
        if (active) setLatestTelemetry(t);
      } catch (e) {}
    }
    postTelemetry();
    const idRef = setInterval(postTelemetry, 5000);
    return () => { active = false; clearInterval(idRef); };
  }, [id]);

  useEffect(() => {
    const vin = car?.vin;
    if (!vin) return;
    async function verifyVin() {
      try {
        const r = await fetch('/api/verify-owner', { method: 'POST', body: JSON.stringify({ vin }), headers: {'Content-Type': 'application/json'} });
        const json = await r.json();
        setOwnerVerified(!!json.verified);
      } catch (e) { setOwnerVerified(null); }
    }
    verifyVin();
  }, [car?.vin]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img src={car.images?.[0] || '/cars/car-placeholder.jpg'} alt={`${car.make} ${car.model}`} className="w-full rounded" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{car.make} {car.model}</h1>
          {/* rest omitted for brevity */}
        </div>
      </div>
    </div>
  );
}
