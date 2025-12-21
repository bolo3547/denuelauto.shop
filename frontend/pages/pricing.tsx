import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Pricing — Denuel Auto</title>
        <meta name="description" content="Denuel Auto pricing" />
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Pricing</h1>
        <p className="text-gray-700 mb-6">Transparent plans for small lots to enterprise groups. Contact sales for custom pricing.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold">Starter</h3>
            <p className="mt-2 text-2xl font-bold">$59 / mo</p>
            <ul className="mt-4 text-sm space-y-2">
              <li>Up to 2 branches</li>
              <li>1,000 vehicles</li>
            </ul>
          </div>
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="font-semibold">Pro</h3>
            <p className="mt-2 text-2xl font-bold">$129 / mo</p>
            <ul className="mt-4 text-sm space-y-2">
              <li>Up to 5 branches</li>
              <li>Unlimited vehicles</li>
            </ul>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold">Enterprise</h3>
            <p className="mt-2 text-2xl font-bold">Custom</p>
            <ul className="mt-4 text-sm space-y-2">
              <li>Unlimited branches</li>
              <li>Dedicated success manager</li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
