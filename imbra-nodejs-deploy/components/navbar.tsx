"use client";
import Link from 'next/link';
import ThemeToggle from './theme-toggle';
import React, { useState, useEffect, useRef } from 'react';

export default function Navbar(){
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Close mobile menu on escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // lock scroll while mobile menu is open and move focus
  useEffect(() => {
    const body = document.body;
    if (mobileOpen) {
      body.style.overflow = 'hidden';
      setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 50);
    } else {
      body.style.overflow = '';
    }

    // Add focus trap for Tab key navigation while drawer is open
    const drawer = drawerRef.current;
    if (!drawer) return;
    const drawerEl = drawer as Element;
    function onKeydown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(drawerEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    drawer.addEventListener('keydown', onKeydown);
    return () => drawer.removeEventListener('keydown', onKeydown);
  }, [mobileOpen]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 py-2 md:py-3 flex items-center justify-between" aria-label="Main navigation">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="text-lg md:text-xl font-semibold text-primary">DENUEL Auto</Link>
          <ul className="hidden md:flex items-center gap-8 text-sm text-gray-700 dark:text-slate-300 list-none">
            <li><a href="#features" className="hover:text-primary">Features</a></li>
            <li><a href="#export" className="hover:text-primary">Export &amp; Shipping</a></li>
            <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
            <li><a href="#help" className="hover:text-primary">Help</a></li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile hamburger - visible only on small screens */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen(v => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-3">
            <a href="#login" className="text-sm px-3 py-2 rounded-full border border-gray-200">Log in</a>
            <a href="/register" className="btn-primary px-4 py-2 rounded-full text-white text-sm">Create system</a>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden={mobileOpen ? 'false' : 'true'}>
        {/* overlay */}
        <div className={`fixed inset-0 bg-black/40 transition-opacity duration-200 ease-out ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        {/* drawer */}
        <div
          ref={drawerRef}
          className={`absolute right-0 top-0 h-full w-11/12 sm:w-80 max-w-xs bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-2 pb-2">
            <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
            <nav className="flex flex-col gap-4 p-2">
              <a ref={firstLinkRef} href="#features" className="text-lg font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Features</a>
              <a href="#export" className="text-lg font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Export &amp; Shipping</a>
              <a href="#pricing" className="text-lg font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Pricing</a>
              <a href="#help" className="text-lg font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Help</a>
              <div className="mt-4 flex flex-col gap-3">
                <a href="#login" className="text-sm px-3 py-2 rounded-full border border-gray-200 text-center">Log in</a>
                <a href="/register" className="btn-primary px-4 py-2 rounded-full text-white text-sm text-center">Create system</a>
              </div>
            </nav>
          </div>
      </div>
      </header>
  );
}
