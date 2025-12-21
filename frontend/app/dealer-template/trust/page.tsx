"use client";
import React from 'react';
import TrustBadge from '@/components/TrustBadge';

export default function DealerTrustPage(){
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Trust Center</h1>
      <p className="text-gray-600 mt-2">Commitment to transparency, vehicle inspections, secure payments and privacy.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">
          <TrustBadge verified={true} title="Inspected" details="Independent inspection & report" />
          <div className="mt-2 text-sm text-gray-600">All cars are inspected by certified mechanics and come with a report.</div>
        </div>
        <div className="p-4 bg-white border rounded">
          <TrustBadge verified={true} title="Secure Payments" details="Encrypted payments, escrow options" />
          <div className="mt-2 text-sm text-gray-600">Secure payment options with verification and escrow support where possible.</div>
        </div>
        <div className="p-4 bg-white border rounded">
          <TrustBadge verified={true} title="Verified Ownership" details="Clear title & ownership documents" />
          <div className="mt-2 text-sm text-gray-600">We verify title and ownership documents prior to listing.</div>
        </div>
      </div>
    </div>
  );
}
