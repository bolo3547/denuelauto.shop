"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import { tenantTheme as defaultTheme } from '../lib/tenantMock';
import { useTenantTheme } from '@/contexts/TenantThemeContext';
import InstallAppButton from './InstallAppButton';
import { FaWhatsapp } from 'react-icons/fa';

export default function DealerHeader({ theme, slug = 'sample-dealer' }: { theme?: any; slug?: string }) {
  const ctx = useTenantTheme();
  const effectiveTheme = theme || ctx.theme || defaultTheme;
  const [favCount, setFavCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [garageCount, setGarageCount] = useState(0);
  useEffect(()=>{
    async function update(){
      try{
        const favRaw = localStorage.getItem(`favs:${slug}`) || '[]';
        const compareRaw = localStorage.getItem(`compare:${slug}`) || '[]';
        const garageRaw = localStorage.getItem(`garage:${slug}`) || '[]';
        setFavCount(JSON.parse(favRaw).length);
        setCompareCount(JSON.parse(compareRaw).length);
        setGarageCount(JSON.parse(garageRaw).length);
        // Try server-side count if authenticated
        try {
          const r = await api.get('/buyer/garage');
          if (r && Array.isArray(r.data)) setGarageCount(r.data.length);
        } catch (e) {}
      }catch(e){}
    }
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [slug]);
  const tone = (effectiveTheme?.brandTone || 'professional') as string;
  const chatLabel = tone === 'formal' ? 'Contact Sales' : tone === 'friendly' ? 'Chat with us' : 'Chat on WhatsApp';
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem(`denuel_${slug}_currency`) || 'USD' : 'USD'));
  const [country, setCountry] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem(`denuel_${slug}_country`) || effectiveTheme?.country || 'Kenya' : effectiveTheme?.country || 'Kenya'));

  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors ${scrolled ? 'bg-white border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/t/${slug}`} className="flex items-center gap-3">
            <img src={effectiveTheme?.logoUrl} alt={`${effectiveTheme?.name} logo`} className="h-8 object-contain" />
            <span className="font-bold text-lg text-slate-800">{effectiveTheme?.name}</span>
          </Link>
          <div className="hidden md:block text-sm text-slate-600">{effectiveTheme?.location}</div>
        </div>
        {/* Center: Search */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <form action={`/t/${slug}/stock`} method="get" className="w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <input placeholder="Search make, model, year, price" name="q" aria-label="Search cars" className="flex-1 px-4 py-3 rounded-full border shadow-sm focus:ring-2" />
              <button aria-label="Search" type="submit" className="rounded-full px-4 py-2 bg-[var(--primary)] text-white">Search</button>
            </div>
          </form>
        </div>
        <nav className="flex items-center gap-3">
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}`}>Home</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/public/cars`}>Stock</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/how-to-buy`}>How to buy</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/contact`}>Contact</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/favorites`}>Favorites {favCount > 0 ? (<span className="text-xs bg-[var(--accent)] text-white px-2 ml-1 rounded-full">{favCount}</span>) : null}</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/compare`}>Compare {compareCount > 0 ? (<span className="text-xs bg-primary text-white px-2 ml-1 rounded-full">{compareCount}</span>) : null}</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/garage`}>Garage {garageCount > 0 ? (<span className="text-xs bg-primary text-white px-2 ml-1 rounded-full">{garageCount}</span>) : null}</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/sell`}>Sell</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/news`}>News</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/deals`}>Deals</a>
          <a className="text-sm text-slate-700 hover:underline" href={`/t/${slug}/ev`}>EV</a>
          <div className="flex items-center gap-2">
            <select aria-label="Country" className="text-sm rounded-md px-2 py-1 border" value={country} onChange={e=>{ setCountry(e.target.value); localStorage.setItem(`denuel_${slug}_country`, e.target.value); }}>
              <option>Kenya</option>
              <option>Tanzania</option>
              <option>Zambia</option>
              <option>Zimbabwe</option>
            </select>
            <select aria-label="Currency" className="text-sm rounded-md px-2 py-1 border" value={currency} onChange={e=>{ setCurrency(e.target.value); localStorage.setItem(`denuel_${slug}_currency`, e.target.value); }}>
              <option>USD</option>
              <option>ZMW</option>
              <option>UGX</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <InstallAppButton />
            <a
              href={`https://wa.me/${(effectiveTheme?.whatsapp || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-2 rounded-full px-3 py-2 text-white shadow-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: (effectiveTheme as any)?.primaryColor }}
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp className="w-5 h-5 text-green-400" />
              <span className="font-medium text-sm">{chatLabel}</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
