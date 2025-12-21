import dynamic from 'next/dynamic';

export const metadata = {
  title: 'Inventory — Dealer',
  description: 'Browse all available vehicles in our inventory with filters for make, model, year and price.'
};

const StockClient = dynamic(() => import('./page.client'), { ssr: false });

export default function StockPage() {
  return <StockClient />;
}
