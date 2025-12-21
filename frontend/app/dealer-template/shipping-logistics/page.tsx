import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Shipping & Logistics — Dealer',
  description: 'Global shipping, logistics and insurance options for exported vehicles.'
};

export default function ShippingLogisticsPage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Shipping & Logistics" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/dealer-template' }, { label: 'Shipping & Logistics' }]} />
      <h1 className="text-2xl font-bold mb-4">Shipping & Logistics</h1>
      <p className="text-gray-700 mb-6">We manage worldwide shipping and logistics — door-to-port, port-to-door, container booking, and insurance. Get an instant shipping quote for your vehicle.</p>
      <Link href="/contact" className="text-blue-600 hover:underline">Request a shipping quote</Link>
    </main>
  );
}
