"use client";
import React from 'react';
import useFavorites from '../../../hooks/useFavorites';
import { cars } from '../../../lib/tenantMock';
import CarCardDealer from '../../../components/dealer/CarCardDealer';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export default function FavoritesPageClient(){
  const { favorites } = useFavorites('demo-slug');
  const favoritesList = cars.filter((c:any) => favorites.includes(c.id));
  if (!favoritesList.length) return (
    <div className="text-center py-8">
      <PageAnalytics pageName="Favorites" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Favorites' }]} />
      You haven't saved any vehicles yet.
    </div>
  );
  return (
    <div>
      <PageAnalytics pageName="Favorites" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Favorites' }]} />
      <h2 className="text-lg font-semibold mb-4">Saved Favorites</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {favoritesList.map(c => <CarCardDealer key={c.id} car={c} />)}
      </div>
    </div>
  );
}
