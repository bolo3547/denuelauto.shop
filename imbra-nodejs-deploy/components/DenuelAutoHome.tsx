"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { IconInventory, IconLeads, IconPayments, IconAgents, IconExport, IconBuyer, IconPhotos } from './icons';
import TrustBar from './TrustBar';
import useVariant from '../hooks/useVariant';
import { trackEvent } from '../utils/analytics';
import HeroSection from './landing/HeroSection';
import FeaturesGrid from './landing/FeaturesGrid';
import PricingPlans from './landing/PricingPlans';
import TestimonialsSection from './landing/TestimonialsSection';
import FooterSection from './landing/FooterSection';
const DemoModal = dynamic(() => import('./DemoModal'), { ssr: false });
import { useLoading } from '../context/LoadingContext';

export default function DenuelAutoHome() {
  // Personalization: get user name from localStorage
  const [userName, setUserName] = useState<string | null>(null);
  React.useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  // Personalization: favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
      } catch { return []; }
    }
    return [];
  });
  const toggleFavorite = (carId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };
  const steps = [
    { title: 'Sign up your dealership', desc: 'Add your details and choose dealer or exporter.' },
    { title: 'Add your cars', desc: 'Create stock numbers, upload photos, set price.' },
    { title: 'Share with buyers & agents', desc: 'Send car links, share via WhatsApp, and let agents log in.' },
    { title: 'Close deals & ship', desc: 'Issue proforma, record payments, book shipments, and print documents.' },
  ];

  const variant = useVariant();
  const [openDemo, setOpenDemo] = useState(false);

  const router = useRouter();

  const { setLoading } = useLoading();

  const onCreate = async () => {
    trackEvent('create_system_click', { variant });
    setLoading(true);
    try {
      await router.push('/register');
    } catch (e) {
      setLoading(false);
    }
  };

  const watchDemo = () => {
    trackEvent('watch_demo_click', { variant });
    setOpenDemo(true);
  };

  // Interactive car search state
  const [search, setSearch] = useState<string>('');
  // Load mock cars for demo listing (kept simple and defensive)
  // @ts-ignore: mock data used only for demo/local development
  const maybeMock = typeof window !== 'undefined' ? require('../dealerData').mockCars : [];
  const mockCars = Array.isArray(maybeMock) ? maybeMock : [];
  const filteredCars = mockCars.filter((car: any) => {
    const q = (search || '').toString().toLowerCase();
    if (!q) return true;
    return (
      (car.make || '').toString().toLowerCase().includes(q) ||
      (car.model || '').toString().toLowerCase().includes(q) ||
      (car.year || '').toString().includes(q) ||
      (car.location || '').toString().toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen flex flex-col relative text-slate-900 antialiased">
      {/* Animated gradient background for hero section */}
      <div className="absolute inset-0 w-full h-[60vh] z-0 animate-gradient-x" style={{background: 'linear-gradient(90deg, #F7F8FC 0%, #E3E6F3 50%, #FFD700 100%)', opacity: 0.18}} aria-hidden="true"></div>
      
      {/* Navigation Header */}
      <header className="relative z-20">
        <nav className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#0F3D91]">Denuel Auto</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                try {
                  const slug = localStorage.getItem('lastTenantSlug');
                  trackEvent('login_click', { remembered: !!slug });
                  if (slug) {
                    router.push(`/t/${slug}/auth/login`);
                    return;
                  }
                } catch (e) {
                  // ignore storage errors
                }
                trackEvent('login_click', { remembered: false });
                router.push('/login');
              }}
              className="text-gray-700 hover:underline"
            >
              Log in
            </button>
            <button aria-label="Create a new system" onClick={onCreate} className="hidden sm:inline-flex items-center justify-center px-5 py-2 border-2 border-[#0F3D91] rounded-lg text-[#0F3D91] font-bold bg-white hover:bg-[#F7F8FC] transition-all duration-200 shadow-sm focus:ring-2 focus:ring-[#FFD700]">Create system</button>
          </div>
        </nav>
      </header>

      {/* Accessibility & Language Options Floating Widget */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 items-center">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            document.documentElement.classList.toggle('dark');
          }}
          className="bg-white dark:bg-[#0F3D91] text-[#0F3D91] dark:text-[#FFD700] rounded-full shadow p-3 hover:scale-105 transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 4.05l-.71.71M21 12h-1M4 12H3m16.24 4.24l-.71-.71M6.34 19.66l-.71-.71" /></svg>
        </button>
        {/* Font Size Toggle */}
        <button
          onClick={() => {
            const root = document.documentElement;
            const current = root.style.fontSize || '16px';
            root.style.fontSize = current === '16px' ? '18px' : '16px';
          }}
          className="bg-white dark:bg-[#0F3D91] text-[#0F3D91] dark:text-[#FFD700] rounded-full shadow p-3 hover:scale-105 transition-all duration-200"
          aria-label="Toggle font size"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M4 4h16M9 9h6v6H9z" /></svg>
        </button>
        {/* Language Toggle */}
        <select title="Select language"
          className="bg-white dark:bg-[#0F3D91] text-[#0F3D91] dark:text-[#FFD700] rounded-full shadow p-2 text-sm"
          aria-label="Select language"
          onChange={e => alert(`Language switched to ${e.target.value}`)}
          defaultValue="en"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="sw">Swahili</option>
        </select>
      </div>

      {/* Enhanced HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 animate-fade-in">
        {userName && (
          <div className="mb-4 text-lg text-[#0F3D91] font-bold animate-fade-in">Welcome back, {userName}!</div>
        )}

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F3D91] drop-shadow-lg mb-4 animate-fade-in">Welcome to DENUEL Auto</h1>
        <p className="text-lg md:text-2xl text-gray-700 font-medium mb-6 max-w-2xl mx-auto animate-fade-in">Africa's most trusted platform for buying, selling, and exporting cars. Experience seamless digital retailing, personalized service, and world-class support.</p>

        <div className="mb-6 flex flex-col items-center">
          <input
            type="text"
            placeholder="Search cars by make, model, year..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-[#0F3D91]"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search cars"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button onClick={onCreate} className="px-8 py-3 rounded-lg bg-[#0F3D91] text-white font-bold text-lg shadow-lg hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200 animate-bounce">Get Started</button>
          <button onClick={watchDemo} className="px-8 py-3 rounded-lg bg-white text-[#0F3D91] font-bold text-lg border-2 border-[#0F3D91] shadow-lg hover:bg-[#F7F8FC] transition-all duration-200 animate-fade-in">Watch Demo</button>
        </div>

        {/* Simple featured car grid (demo-only) */}
        <div className="w-full max-w-6xl mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCars.slice(0, 9).map((car: any) => (
            <div key={car.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 transition-transform duration-200">
              <img src={car.main_image_url} alt={`${car.make} ${car.model}`} className="w-full h-40 object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-lg text-[#0F3D91]">{car.year} {car.make} {car.model}</h3>
                <p className="text-sm text-gray-600 mb-2">{car.grade} • {car.transmission} • {car.fuel}</p>
                <p className="text-sm text-gray-700">Mileage: {car.mileage_km?.toLocaleString?.() ?? car.mileage_km} km</p>
                <p className="text-sm text-gray-700">Location: {car.location}</p>
                <div className="mt-2 font-bold text-[#FFD700] text-xl">${car.price_usd?.toLocaleString?.() ?? car.price_usd} USD</div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="px-4 py-2 rounded bg-[#0F3D91] text-white font-bold hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200">View Details</button>
                  <button
                    aria-label={favorites.includes(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => toggleFavorite(car.id)}
                    className={`px-2 py-2 rounded-full border-2 ${favorites.includes(car.id) ? 'border-[#FFD700] bg-[#FFD700] text-[#0F3D91]' : 'border-gray-300 bg-white text-gray-400'} hover:scale-110 transition-all duration-200`}
                  >
                    {favorites.includes(car.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust metrics, logos and social proof */}
      <TrustBar />

      {/* Core features - world-class cards with micro-interactions */}
      <FeaturesGrid />

      {/* Pricing & Plans Section */}
      <PricingPlans />

      <TestimonialsSection />

      <FooterSection />

      {/* Resources & Help Section */}
      <section className="w-full max-w-5xl mx-auto mb-8 px-4 py-8 rounded-xl bg-white/80 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-4">Resources & Help</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <a href="/faqs" className="bg-[#F7F8FC] rounded-lg p-4 shadow flex flex-col items-center hover:bg-[#FFD700] transition-all duration-200">
            <span className="font-bold text-[#0F3D91] mb-2">FAQs</span>
            <span className="text-gray-700 text-sm">Common questions answered</span>
          </a>
          <a href="/help-center" className="bg-[#F7F8FC] rounded-lg p-4 shadow flex flex-col items-center hover:bg-[#FFD700] transition-all duration-200">
            <span className="font-bold text-[#0F3D91] mb-2">Help Center</span>
            <span className="text-gray-700 text-sm">Get support and assistance</span>
          </a>
          <a href="/onboarding" className="bg-[#F7F8FC] rounded-lg p-4 shadow flex flex-col items-center hover:bg-[#FFD700] transition-all duration-200">
            <span className="font-bold text-[#0F3D91] mb-2">Onboarding Guide</span>
            <span className="text-gray-700 text-sm">Step-by-step setup help</span>
          </a>
          <a href="/training" className="bg-[#F7F8FC] rounded-lg p-4 shadow flex flex-col items-center hover:bg-[#FFD700] transition-all duration-200">
            <span className="font-bold text-[#0F3D91] mb-2">Training & Demos</span>
            <span className="text-gray-700 text-sm">Learn and explore features</span>
          </a>
        </div>
      </section>
      <DemoModal open={openDemo} onClose={() => setOpenDemo(false)} />
    </main>
  );
}