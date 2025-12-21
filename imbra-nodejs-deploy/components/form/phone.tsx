import React from 'react';

type PhoneFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { id?: string; label?: React.ReactNode };

const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(function PhoneField({ id, label, ...props }, ref) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium block mb-1">{label}</label>
      <input id={id} ref={ref} {...props} className="w-full p-3 border rounded-2xl" placeholder="+260 97 123 4567" />
    </div>
  );
});

export default PhoneField;
