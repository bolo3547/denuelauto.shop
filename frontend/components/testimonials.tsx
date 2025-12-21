import React from 'react';

const testimonials = [
  { name: 'Grace M.', text: 'Fast service and verified cars — a fantastic experience.' },
  { name: 'Paul K.', text: 'USSD reservation made it so easy to secure my car.' },
  { name: 'Lena D.', text: 'Transparent CIF estimator helped plan my purchase.' },
];

export default function Testimonials(){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <div key={t.name} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm">
          <div className="text-sm text-gray-700 dark:text-slate-300">"{t.text}"</div>
          <div className="mt-3 text-xs text-gray-500">— {t.name}</div>
        </div>
      ))}
    </div>
  );
}
