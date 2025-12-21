import React from 'react';

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { id?: string; label?: React.ReactNode };

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, id, ...props }, ref) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium block mb-1">{label}</label>
      <input id={id} ref={ref} {...props} className="w-full p-3 border rounded-2xl" />
    </div>
  );
});

export default TextField;
