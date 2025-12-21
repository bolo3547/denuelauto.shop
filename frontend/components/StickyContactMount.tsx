"use client";
import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import StickyContactBar from './StickyContactBar';

export default function StickyContactMount(){
  useEffect(()=>{
    const el = document.getElementById('sticky-contact-root');
    if (!el) return;

    // Avoid creating multiple roots if already mounted
    const existing = (window as any).__sticky_root as Root | undefined;
    if (existing) return;

    try {
      const root = createRoot(el);
      (window as any).__sticky_root = root;
      root.render(<StickyContactBar />);
      return () => {
        // Defer unmount to avoid calling root.unmount synchronously while React
        // is still rendering another tree (this can cause the React warning
        // about synchronous unmounts). Scheduling on the next tick prevents
        // the race condition.
        const current = (window as any).__sticky_root as Root | undefined;
        if (!current) return;
        setTimeout(() => {
          try { current.unmount(); } catch (e) { /* ignore */ }
          try { delete (window as any).__sticky_root; } catch(e) {}
        }, 0);
      };
    } catch (e) {
      // Last-resort: append simple node
      const frag = document.createElement('div');
      frag.setAttribute('data-sticky-fallback', '1');
      el.appendChild(frag);
      return () => { try { el.removeChild(frag); } catch(_) {} };
    }
  }, []);

  return null;
}
