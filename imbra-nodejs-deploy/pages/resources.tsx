import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Resources — Denuel Auto</title>
        <meta name="description" content="Resources for Denuel Auto" />
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Resources</h1>
        <p className="text-gray-700 mb-6">Guides, templates, and assets to help you run your dealership effectively.</p>
        <ul className="space-y-3 text-sm text-gray-700">
          <li><Link href="/docs" className="text-blue-600 hover:underline">Documentation</Link></li>
          <li><Link href="/support" className="text-blue-600 hover:underline">Support</Link></li>
          <li><a href="#" className="text-blue-600 hover:underline">Marketing templates</a></li>
        </ul>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
