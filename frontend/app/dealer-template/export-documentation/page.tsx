import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Export Documentation — Dealer',
  description: 'Guides and sample documentation for vehicle export including Bill of Lading and export declarations.'
};

export default function ExportDocumentationPage(){
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PageAnalytics pageName="Export Documentation" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/dealer-template' }, { label: 'Export Documentation' }]} />
      <h1 className="text-2xl font-bold mb-4">Export Documentation</h1>
      <p className="text-gray-700 mb-6">We provide full export documentation including Bill of Lading, Export Declaration, and inspection certificates required for your destination country.</p>
      <Link href="/how-to-buy" className="text-blue-600 hover:underline">Learn more about export documentation</Link>
    </main>
  );
}
