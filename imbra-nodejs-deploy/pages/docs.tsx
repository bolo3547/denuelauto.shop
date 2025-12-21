import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Docs — Denuel Auto</title>
        <meta name="description" content="Denuel Auto documentation" />
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Documentation</h1>
        <p className="text-gray-700 mb-6">Developer and user documentation for Denuel Auto.</p>
        <ul className="space-y-3 text-sm text-gray-700">
          <li><a href="#" className="text-blue-600 hover:underline">Getting started</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">API reference</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">Integration guides</a></li>
        </ul>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
