"use client";
import React, { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [mode, setMode] = useState<'dark'|'light'>(() => {
    if (typeof window === 'undefined') return 'light';
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }, [mode]);
  return (
    <button aria-label="Toggle theme" onClick={() => setMode(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
