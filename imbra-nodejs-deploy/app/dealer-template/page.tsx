import dynamic from 'next/dynamic';

export const metadata = {
  title: 'Dealer Home — Inventory & Services',
  description: 'Find quality pre-owned vehicles, explore services like shipping and inspection, and find out how to buy.'
};

const DealerHomeClient = dynamic(() => import('./page.client'), { ssr: false });

export default function DealerHomePage() {
  return <DealerHomeClient />;
}

/* Server wrapper only — the client component lives in page.client.tsx */
