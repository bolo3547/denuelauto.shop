"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "../utils/analytics";

export default function SiteHeader({ siteName = "Denuel Auto" }: { siteName?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = (path: string, ev?: string) => {
    if (ev) trackEvent(ev);
    if (typeof window !== "undefined") window.location.href = path;
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors ${scrolled ? 'bg-white border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">DA</span>
            </div>
            <span className="font-bold text-lg text-slate-800">{siteName}</span>
          </Link>
        </div>
        {/* Center: Search */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <form action="/stock" method="get" className="w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <input placeholder="Search make, model, year, price" name="q" aria-label="Search cars" className="flex-1 px-4 py-3 rounded-full border shadow-sm focus:ring-2" />
              <button aria-label="Search" type="submit" className="rounded-full px-4 py-2 bg-blue-600 text-white">Search</button>
            </div>
          </form>
        </div>
        <nav className="flex items-center gap-3">
          <a className="text-sm text-slate-700 hover:underline" href="/">Home</a>
          <a className="text-sm text-slate-700 hover:underline" href="/stock">Stock</a>
          <a className="text-sm text-slate-700 hover:underline" href="/features">Features</a>
          <a className="text-sm text-slate-700 hover:underline" href="/pricing">Pricing</a>
          <a className="text-sm text-slate-700 hover:underline" href="/demo">Demo</a>
          <a className="text-sm text-slate-700 hover:underline" href="/resources">Resources</a>
          <a className="text-sm text-slate-700 hover:underline" href="/support">Support</a>
          <button
            onClick={() => handleCta('/login', 'nav_login')}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-3 py-2"
          >
            Log in
          </button>
          <button
            onClick={() => handleCta('/register', 'nav_get_started')}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Get started
          </button>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>

      {open && (
        <div className="md:hidden py-4 space-y-3 text-sm font-medium text-gray-700 bg-white border-t">
          <a href="/stock" className="block px-3 py-2 rounded-md hover:bg-gray-50">Stock</a>
          <a href="/features" className="block px-3 py-2 rounded-md hover:bg-gray-50">Features</a>
          <a href="/pricing" className="block px-3 py-2 rounded-md hover:bg-gray-50">Pricing</a>
          <a href="/demo" className="block px-3 py-2 rounded-md hover:bg-gray-50">Demo</a>
          <a href="/resources" className="block px-3 py-2 rounded-md hover:bg-gray-50">Resources</a>
          <a href="/support" className="block px-3 py-2 rounded-md hover:bg-gray-50">Support</a>
          <div className="pt-2 px-3">
            <button onClick={() => handleCta('/register', 'mobile_get_started')} className="w-full px-4 py-2 rounded-lg text-white bg-blue-600">Get started</button>
          </div>
        </div>
      )}
    </header>
  );
}
