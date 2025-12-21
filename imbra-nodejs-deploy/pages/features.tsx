import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Features — Denuel Auto</title>
        <meta name="description" content="Denuel Auto features" />
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Features</h1>
        <p className="text-gray-700 mb-6">Explore the core features that power Denuel Auto — inventory, sales, finance, HR, analytics, and marketing.</p>
        <ul className="grid sm:grid-cols-2 gap-4 list-inside">
          <li className="bg-gray-50 p-4 rounded-lg border">Inventory & Lot Management</li>
          <li className="bg-gray-50 p-4 rounded-lg border">Mobile Money & Payments</li>
          <li className="bg-gray-50 p-4 rounded-lg border">Agent Tools & Commissions</li>
          <li className="bg-gray-50 p-4 rounded-lg border">Analytics & Reporting</li>
        </ul>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
