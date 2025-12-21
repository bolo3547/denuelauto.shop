import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Support — Denuel Auto</title>
        <meta name="description" content="Denuel Auto support" />
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Support</h1>
        <p className="text-gray-700 mb-6">Need help? Reach out to our support team for onboarding, troubleshooting, or custom requests.</p>
        <div className="space-y-4">
          <a href="mailto:denuelinambao@gmail.com" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg">Email Support</a>
          <Link href="/" className="block text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
