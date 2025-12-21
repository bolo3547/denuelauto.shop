import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Terms of Service — Denuel Auto</title>
        <meta name="description" content="Denuel Auto terms of service" />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-700 mb-4">This is a placeholder terms document. Replace with your legal terms before going to production.</p>
        <p className="text-gray-600">By using Denuel Auto you agree to our terms. Contact <a href="mailto:denuelinambao@gmail.com" className="text-blue-600">denuelinambao@gmail.com</a> for questions.</p>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
