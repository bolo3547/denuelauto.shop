"use client";
import { useEffect } from 'react'

export default function Pwa() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const reg = async () => {
        try { await navigator.serviceWorker.register('/sw.js'); } catch (e) { /* ignore */ }
      };
      reg();
    }
  }, []);
  return null;
}
