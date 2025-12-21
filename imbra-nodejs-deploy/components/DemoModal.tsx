"use client";
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLoading } from '../context/LoadingContext';
import { trackEvent } from '../utils/analytics';

export default function DemoModal({ open, onClose }: { open: boolean, onClose: () => void }){
  if(!open) return null;
  const router = useRouter();
  const { setLoading } = useLoading();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const closeWithTrack = (reason?: string) => {
    trackEvent('demo_close_click', reason ? { reason } : undefined);
    onClose();
  };

  const onContinue = async () => {
    trackEvent('demo_continue_click');
    setLoading(true);
    try {
      await router.push('/register');
    } catch (e) {
      setLoading(false);
    }
  };

  // Focus trap + Escape handling
  useEffect(() => {
    const prevActive = document.activeElement as HTMLElement | null;
    const container = modalRef.current;
    if (container) {
      // focus the first focusable element inside
      const focusable = container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        trackEvent('demo_escape_close');
        onClose();
      }

      if (e.key === 'Tab' && container) {
        const focusable = Array.from(container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.hasAttribute('disabled'));
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    // prevent background scrolling
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevActive) prevActive.focus();
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="demo-title" aria-describedby="demo-desc" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => closeWithTrack('backdrop')} />
      <div ref={modalRef} className="relative w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 id="demo-title" className="text-xl font-semibold">Denuel Auto — Demo Preview</h3>
          <button onClick={() => closeWithTrack('button')} aria-label="Close demo" className="p-2">✕</button>
        </div>
        <p id="demo-desc" className="text-sm text-slate-600 mb-4">Watch a quick walkthrough to see how Denuel speeds up listings and exports.</p>

        <div className="w-full rounded overflow-hidden bg-slate-50 shadow-inner">
          <div className="relative w-full h-56">
            <Image src="/hero-mock.svg" alt="Demo preview" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>List cars with photos</span></li>
          <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Auto proformas & receipts</span></li>
          <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Shipments & CIF rules</span></li>
        </ul>

        <div className="mt-6 flex justify-end gap-3">
          <button aria-label="Close demo" onClick={() => closeWithTrack('button')} className="px-4 py-2 rounded border">Close</button>
          <button aria-label="Continue to sign up" onClick={onContinue} className="px-4 py-2 rounded bg-[#0F3D91] text-white">Continue to sign up</button>
        </div>
      </div>
    </div>
  );
}
