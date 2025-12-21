import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'FAQ — Dealer',
  description: 'Frequently asked questions about buying, shipping and importing a vehicle.'
};

const faqs = [
  { q: 'How do I buy a car?', a: 'Browse inventory, request inspection, then place an order through our checkout process.' },
  { q: 'What payments do you accept?', a: 'We accept bank transfers and escrow services as arranged with the dealer.' },
  { q: 'Do you provide shipping?', a: 'Yes — we offer global shipping and logistics options.' },
];

export default function FAQPage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="FAQ" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/dealer-template' }, { label: 'FAQ' }]} />
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="bg-white p-4 rounded shadow-sm">
            <summary className="font-semibold cursor-pointer">{f.q}</summary>
            <div className="mt-2 text-gray-700">{f.a}</div>
          </details>
        ))}
      </div>
    </main>
  );
}
