"use client";
import React from 'react';

export default function Stepper({ steps, current }: { steps: string[], current: number }){
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, idx) => (
        <div key={s} className={`flex items-center ${idx < current ? 'opacity-70' : idx === current ? '' : 'opacity-40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx < current ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-700 border'}`}>{idx+1}</div>
          <div className="ml-2 text-sm">{s}</div>
        </div>
      ))}
    </div>
  );
}
