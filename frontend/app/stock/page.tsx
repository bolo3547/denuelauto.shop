import { redirect } from 'next/navigation';

export default function StockRedirect() {
  // Keep a single canonical inventory route under /dealer-template/stock
  redirect('/dealer-template/stock');
}
