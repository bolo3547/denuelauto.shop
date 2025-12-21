"use client";
import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';
import LeadCaptureModal from './LeadCaptureModal';

export default function StickyContactBar() {
  const phone = '+260971234567';
  const wa = '260971234567';
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-60 flex flex-col items-end gap-3">
      <a
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('sticky_contact_click', { channel: 'whatsapp' })}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 11.5a9.38 9.38 0 01-1.1 4.3l.1.1-1.7 5 5-1.7.1.1a9.4 9.4 0 10-2.7-7.8z" fill="#fff" />
        </svg>
        <span className="font-semibold text-sm">Chat</span>
      </a>

      <a
        href={`tel:${phone}`}
        onClick={() => trackEvent('sticky_contact_click', { channel: 'call' })}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="Call dealer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 5a2 2 0 012-2h2a1 1 0 011 .76l1 5a1 1 0 01-.27.9l-1.6 1.6a12 12 0 005.5 5.5l1.6-1.6a1 1 0 01.9-.27l5 1a1 1 0 01.76 1v2a2 2 0 01-2 2H19C9.6 23 1 14.4 1 5V5z" fill="#fff" />
        </svg>
        <span className="font-semibold text-sm">Call</span>
      </a>

      <button
        onClick={() => { trackEvent('sticky_contact_click', { channel: 'quote' }); setLeadOpen(true); }}
        className="flex items-center gap-2 bg-[#FFD700] text-[#0F3D91] px-4 py-2 rounded-full shadow-lg hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
        aria-label="Request a quote"
      >
        <span className="font-semibold text-sm">Get Quote</span>
      </button>

      <LeadCaptureModal open={leadOpen} onClose={()=>setLeadOpen(false)} context="sticky_contact" />
    </div>
  );
}
