"use client";
import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';
import { cars } from '../../../lib/tenantMock';
import { DealerCar } from '../../../types/dealerCar';
import CarCardDealer from '../../../components/dealer/CarCardDealer';
import FilterSidebar from '../../../components/dealer/FilterSidebar';
import CarComparison from '../../../components/CarComparison';
import CarLoadingAnimation from '../../../components/CarLoadingAnimation';

export default function StockPageClient(){
  const [items, setItems] = useState(cars);
  const [comparedCars, setComparedCars] = useState<DealerCar[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { const timer = setTimeout(()=>setIsLoading(false), 2000); return ()=>clearTimeout(timer); }, []);
  useEffect(() => { try { const isDisabled = localStorage.getItem('disableCarAnimation'); if(isDisabled === 'true') setIsLoading(false); }catch(e){} }, []);
  useEffect(() => { const raw = localStorage.getItem('compare:sample-dealer') || '[]'; const comparedIds = JSON.parse(raw); const compared = cars.filter(car => comparedIds.includes(car.id)); setComparedCars(compared); }, []);

  function onApply(filters:any){ let list = cars; if (filters.make) list=list.filter(c=>c.make===filters.make); if (filters.model) list=list.filter(c=>c.model===filters.model); if(filters.minYear) list=list.filter(c=>c.year>=Number(filters.minYear)); if(filters.maxYear) list=list.filter(c=>c.year<=Number(filters.maxYear)); if(filters.maxPrice) list=list.filter(c=>!c.price_usd || c.price_usd<=Number(filters.maxPrice)); if(filters.transmission) list=list.filter(c=>c.transmission===filters.transmission); if(filters.fuel) list=list.filter(c=>c.fuel===filters.fuel); if(filters.status) list=list.filter(c=>c.status===filters.status); if(filters.bodyType) list=list.filter(c=>c.bodyType===filters.bodyType); if(filters.color) list=list.filter(c=>c.color===filters.color); setItems(list); }
  const updateComparedCars = () => { const raw = localStorage.getItem('compare:sample-dealer') || '[]'; const comparedIds = JSON.parse(raw); const compared = cars.filter(car => comparedIds.includes(car.id)); setComparedCars(compared); };

  if (isLoading) return (<CarLoadingAnimation message="Loading inventory..." direction="rtl" duration={3} disableControl={true} onDisable={()=>setIsLoading(false)} />);

  return (
    <>
      <PageAnalytics pageName="Inventory" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Inventory' }]} />
      <div className="grid md:grid-cols-4 gap-6">
        <aside className="hidden md:block"><div className="bg-white p-3 rounded border shadow-sm"><FilterSidebar cars={cars} onApply={onApply} /></div></aside>
        <div className="md:col-span-3">
          <div className="mb-4 text-sm text-gray-600">Showing {items.length} vehicles</div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{items.map(c => <CarCardDealer key={c.id} car={c} onCompareUpdate={updateComparedCars} />)}</div>
        </div>
      </div>
      {comparedCars.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">{/* ... */}</div>
        </div>
      )}
      {showComparison && <CarComparison cars={cars.map(car => ({ ...car, mileageKm: car.mileage_km, engineCc: car.engine_cc, priceUsd: car.price_usd, priceLocal: car.price_local_zmw }))} onClose={()=>setShowComparison(false)} />}
    </>
  );
}
