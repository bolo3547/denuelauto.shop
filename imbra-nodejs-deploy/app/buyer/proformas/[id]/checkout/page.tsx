export function generateStaticParams() { return [{ id: 'placeholder' }]; }

import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const ClientCheckout = dynamic(() => import('./ClientCheckout'), { ssr: false });

export const metadata: Metadata = {
  title: 'Checkout',
};

export default function CheckoutPage() {
  return (
    <div>
      <ClientCheckout />
    </div>
  );
}
// wrapper only
