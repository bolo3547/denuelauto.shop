import React from 'react';
import { cars } from '../../../lib/tenantMock';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Compare Cars — Dealer',
  description: 'Compare vehicles side-by-side to find the right car and features.'
};

export default function ComparePage(){
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Compare Cars" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Inventory', href: '/dealer-template/stock' }, { label: 'Compare' }]} />
      <h1 className="text-2xl font-bold mb-4">Compare Cars</h1>
      <p className="text-gray-700 mb-6">Select vehicles from the inventory to compare specs side-by-side. Use the "Compare" buttons on each listing to add cars to your comparison list.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.slice(0,6).map((c: any) => (
          <div key={c.id} className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">{c.make} {c.model}</h3>
            <div className="text-sm text-gray-500">{c.year}</div>
            <Link href="/stock" className="text-blue-600 hover:underline mt-2 inline-block">View in inventory</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
