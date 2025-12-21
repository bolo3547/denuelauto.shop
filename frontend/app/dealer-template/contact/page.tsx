import dynamic from 'next/dynamic';
import { tenantTheme } from '../../../lib/tenantMock';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'Contact — Dealer',
  description: 'Get in touch with the dealer about stock, shipping, payments, or export documentation.'
};

const ContactPageClient = dynamic(() => import('./page.client'), { ssr: false });
export default function ContactPage(){
  return <ContactPageClient />;
}
