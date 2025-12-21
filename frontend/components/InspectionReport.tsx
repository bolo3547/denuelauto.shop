"use client";
import React from 'react';

export default function InspectionReport({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-4 border rounded p-3 bg-white">
      <h4 className="text-sm font-semibold">Inspection Report</h4>
      <div className="mt-2 text-sm text-gray-600">The vehicle has been inspected by a partner mechanic. Review the report:</div>
      <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-blue-600 hover:underline">View inspection report (pdf)</a>
    </div>
  );
}
