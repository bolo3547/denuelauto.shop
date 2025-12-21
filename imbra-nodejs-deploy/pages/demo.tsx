import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Demo — Denuel Auto</title>
        <meta name="description" content="Book a demo of Denuel Auto" />
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Book a Demo</h1>
        <p className="text-gray-700 mb-8">See Denuel Auto in action — request a personalised walkthrough for your dealership.</p>
        <div className="space-y-4">
          <a href="mailto:denuelinambao@gmail.com" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg">Email us to schedule</a>
          <Link href="/" className="block text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
