"use client";
import React, { useState } from 'react';

type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { id?: string; label?: React.ReactNode };

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ id, label, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input id={id} ref={ref} type={show ? 'text' : 'password'} {...props} className="w-full p-3 border rounded-2xl" />
        <button type="button" onClick={() => setShow(s => !s)} className="p-2 rounded bg-slate-100">{show ? 'Hide' : 'Show'}</button>
      </div>
    </div>
  );
});

export default PasswordField;
