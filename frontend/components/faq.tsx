import React from 'react';

const faqs = [
  { q: 'How do I reserve a car?', a: 'Use our USSD or reserve online by paying a small deposit.' },
  { q: 'Can I ship to other countries?', a: 'Yes, we arrange exports from Dar, Durban and Walvis Bay.' },
  { q: 'What payment providers do you support?', a: 'MTN & Airtel mobile money, and bank transfers.' },
  { q: 'Can I test drive before purchase?', a: 'Contact the branch to arrange a test drive.' },
];

export default function Faq(){
  return (
    <div className="space-y-2">
      {faqs.map(f => (
        <details className="bg-card p-4 rounded-2xl border" key={f.q}>
          <summary className="font-semibold cursor-pointer">{f.q}</summary>
          <p className="mt-2 text-sm text-gray-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
