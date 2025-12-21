import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Customer Service — Dealer',
  description: 'Contact customer support, open tickets and resolve concerns with your orders and shipping.'
};

export default function CustomerServicePage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Customer Service" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Customer Service' }]} />
      <h1 className="text-2xl font-bold mb-4">Customer Service</h1>
      <p className="text-gray-700 mb-6">We’re here to help — email support or start a live chat to get assistance with your inquiry.</p>
    </main>
  );
}
