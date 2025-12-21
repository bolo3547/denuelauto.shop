import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Payment Options — Dealer',
  description: 'Learn about payment methods, bank transfers, escrow and other payment options available with this dealer.'
};

export default function PaymentOptionsPage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Payment Options" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/dealer-template' }, { label: 'Payment Options' }]} />
      <h1 className="text-2xl font-bold mb-4">Payment Options</h1>
      <p className="text-gray-700 mb-6">We accept international wire transfers, escrow, and other payment methods depending on the dealer policy. Contact us for details.</p>
    </main>
  );
}
