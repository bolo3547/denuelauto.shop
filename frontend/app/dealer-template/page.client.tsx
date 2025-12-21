"use client";
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';
import { trackEvent } from '@/utils/analytics';
import { tenantTheme, featuredCars, cars } from '../../lib/tenantMock';
import HeroSearch from '../../components/dealer/HeroSearch';
import FeaturedStrip from '../../components/dealer/FeaturedStrip';
import CarCardDealer from '../../components/dealer/CarCardDealer';
import CarLoadingAnimation from '../../components/CarLoadingAnimation';

export default function DealerHomeClient(){
  const [filters, setFilters] = useState({});
  const [filteredCars, setFilteredCars] = useState(cars);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try { const isDisabled = localStorage.getItem('disableCarAnimation'); if (isDisabled === 'true') setIsLoading(false); } catch(e) {}
  }, []);

  function onSearch(filters:any){
    setFilters(filters);
    let items = cars;
    if (filters.make) items = items.filter((c:any)=>c.make === filters.make);
    if (filters.model) items = items.filter((c:any)=>c.model.toLowerCase().includes((filters.model || '').toLowerCase()));
    if (filters.minYear) items = items.filter((c:any)=>c.year >= Number(filters.minYear));
    if (filters.maxYear) items = items.filter((c:any)=>c.year <= Number(filters.maxYear));
    if (filters.transmission) items = items.filter((c:any)=>c.transmission === filters.transmission);
    if (filters.maxPrice) items = items.filter((c:any)=> (c.price_usd || c.price_local_zmw) <= Number(filters.maxPrice));
    setFilteredCars(items);
  }

  if (isLoading) return (
    <CarLoadingAnimation
      message="Loading your cars..."
      direction="rtl"
      duration={3}
      disableControl={true}
      onDisable={() => setIsLoading(false)}
    />
  );

  return (
    <div>
      <PageAnalytics pageName="Dealer Home" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }]} />
      <section className="bg-gradient-to-b from-gray-50 to-white p-6 rounded">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold">{tenantTheme.heroTitle}</h1>
            <p className="text-gray-600 mt-2">{tenantTheme.heroSubtitle}</p>
            <div className="flex gap-3 mt-4">
              <a href="/dealer-template/stock" onClick={() => trackEvent('cta_click', { label: 'Browse all stock', href: '/dealer-template/stock' })} className="px-4 py-2 rounded border">Browse all stock</a>
              <a href="/dealer-template/how-to-buy" onClick={() => trackEvent('cta_click', { label: 'How to buy', href: '/dealer-template/how-to-buy' })} className="px-4 py-2 rounded bg-blue-600 text-white">How to buy</a>
            </div>
          </div>
          <div className="md:col-span-1">
            <HeroSearch cars={cars} onSearch={onSearch} />
          </div>
        </div>
      </section>
      <div className="mt-6"><FeaturedStrip featured={featuredCars} /></div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Inventory</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{filteredCars.map((c:any)=> (<CarCardDealer key={c.id} car={c} />))}</div>
      </div>
    </div>
  );
}
