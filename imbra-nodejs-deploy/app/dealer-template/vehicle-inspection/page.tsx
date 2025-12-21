import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Vehicle Inspection — Dealer',
  description: 'Comprehensive vehicle inspection services and packages for peace of mind.'
};

export default function VehicleInspectionPage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Vehicle Inspection" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Inventory', href: '/dealer-template/stock' }, { label: 'Vehicle Inspection' }]} />
      <h1 className="text-2xl font-bold mb-4">Vehicle Inspection</h1>
      <p className="text-gray-700 mb-6">We offer comprehensive vehicle inspection reports, including mechanical checks, frame and accident history checks, and photographic evidence. Choose an inspection level that suits your needs.</p>
      <Link href="/contact" className="text-blue-600 hover:underline">Contact us to arrange an inspection</Link>
    </main>
  );
}
