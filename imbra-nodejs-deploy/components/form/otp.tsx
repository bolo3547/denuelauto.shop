"use client";
import React from 'react';

type OTPFieldProps = { id?: string; label?: React.ReactNode };
export default function OTPField({ id, label }: OTPFieldProps){
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium block mb-1">{label}</label>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input key={i} aria-label={`otp-digit-${i+1}`} type="text" maxLength={1} className="w-10 text-center p-2 border rounded" />
        ))}
      </div>
    </div>
  );
}
