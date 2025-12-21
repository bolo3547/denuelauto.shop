import dynamic from 'next/dynamic';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';
export const metadata = {
  title: 'My Favorites — Dealer',
  description: 'A list of vehicles you have saved as favorites.'
};
const FavoritesClient = dynamic(() => import('./page.client'), { ssr: false });
export default function FavoritesPage(){
  return <FavoritesClient />;
}
