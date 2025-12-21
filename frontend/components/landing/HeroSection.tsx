"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { trackEvent } from '../../utils/analytics';
import useVariant from '../../hooks/useVariant';

type Props = { onCreate?: () => void; onWatchDemo?: () => void };
export default function HeroSection({ onCreate, onWatchDemo }: Props) {
  const variant = useVariant();
  const router = useRouter();

  // allow caller to provide handlers (DenuelAutoHome will pass in demo open handler)
  const internalOnCreate = onCreate ?? (() => {
    trackEvent('create_system_click', { variant });
    router.push('/register');
  });

  const internalOnWatchDemo = onWatchDemo ?? (() => {
    trackEvent('watch_demo_click', { variant });
    // Demo handled by parent if needed
  });

  const prefetchRegister = () => {
    try {
      // router.prefetch may be available; guard for type-safety
      (router as any)?.prefetch?.('/register');
    } catch (e) {
      // ignore
    }
  };

  return (
    <section role="region" aria-labelledby="hero-heading" aria-describedby="hero-sub" className="flex flex-col-reverse md:flex-row items-center justify-between flex-1 py-20 gap-8 animate-fade-in max-w-6xl mx-auto px-6">
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h1 id="hero-heading" className="text-4xl md:text-5xl font-extrabold text-[#0F3D91] mb-4 leading-tight">Sell faster, ship globally — all from one dashboard</h1>
        <p id="hero-sub" className="text-lg text-gray-700 mb-6 max-w-xl">Denuel Auto helps dealerships list export-ready cars, manage agents, and close deals faster with built-in proformas and shipment tools. Get started for free or watch a quick demo.</p>
        <div className="flex items-center gap-4 justify-center md:justify-start">
          <button aria-label="Get started for free" data-testid="hero-cta-start" onClick={internalOnCreate} onMouseEnter={prefetchRegister} className="px-6 py-3 rounded-lg bg-[#0F3D91] text-white font-bold shadow hover:bg-[#0B2A6A] transition-all duration-200">Get started — it's free</button>
          <button aria-label="Watch demo" data-testid="hero-cta-demo" onClick={internalOnWatchDemo} className="px-5 py-3 rounded-lg bg-white border border-gray-200 text-[#0F3D91] font-bold shadow hover:scale-105 transition-transform duration-150">Watch demo</button>
        </div>
        <div className="mt-6 text-sm text-gray-600">No credit card required • 14-day trial</div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-[360px] h-[210px] rounded-xl shadow-lg overflow-hidden bg-white">
          <Image src="/hero-mock.svg" alt="Denuel Auto screenshot" width={720} height={370} priority />
        </div>
      </div>
    </section>
  );
}