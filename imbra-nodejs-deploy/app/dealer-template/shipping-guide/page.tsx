import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Shipping Guide — Dealer',
  description: 'A practical guide to shipping, containerization, and customs when importing vehicles.'
};

export default function ShippingGuidePage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Shipping Guide" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/dealer-template' }, { label: 'Shipping Guide' }]} />
      <h1 className="text-2xl font-bold mb-4">Shipping Guide</h1>
      <p className="text-gray-700 mb-6">Step-by-step guide covering booking, containerization, customs, and delivery options.</p>
    </main>
  );
}
