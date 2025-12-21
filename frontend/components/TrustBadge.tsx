"use client";
import React from 'react';

export default function TrustBadge({ verified = false, title = 'Inspected', details = '' }: { verified?: boolean; title?: string; details?: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white border text-sm" title={details}>
      <span className={`w-4 h-4 rounded-full ${verified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      <span className="font-medium">{title}</span>
    </div>
  );
}
