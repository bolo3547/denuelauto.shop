import React from 'react';
import HowToBuyPage from '../../../components/HowToBuyPage';
import { tenantTheme } from '../../../lib/tenantMock';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export const metadata = {
  title: 'How to Buy — Dealer',
  description: 'A step-by-step guide on how to buy a vehicle, place an order, and manage export and shipping.'
};

export default function DealerTemplateHowToBuy(){
  return (
    <>
      <PageAnalytics pageName="How to Buy" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'How to Buy' }]} />
      <HowToBuyPage tenantTheme={tenantTheme} />
    </>
  );
}
