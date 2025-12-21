'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaChevronUp } from 'react-icons/fa';
import { useTenantTheme } from '../tenant';

interface FloatingWidgetsProps {
  tenantSlug: string;
}

export default function FloatingWidgets({ tenantSlug }: FloatingWidgetsProps) {
  const { settings } = useTenantTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const phone = settings.support.whatsappNumber;
    if (!phone) return;
    const text = encodeURIComponent(`Hello ${settings.tenantName}, I'm interested in your vehicles.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const callPhone = () => {
    const phone = settings.support.phone;
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      {/* Fixed Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-stretch">
          {settings.support.phone && (
            <button
              onClick={callPhone}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-medium"
              aria-label="Call us"
            >
              <FaPhone />
              <span>Call</span>
            </button>
          )}
          {settings.support.whatsappNumber && (
            <button
              onClick={openWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-medium"
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Button (Desktop) */}
      {settings.support.whatsappNumber && (
        <button
          onClick={openWhatsApp}
          className="hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="text-2xl" />
        </button>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed z-50 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
            settings.support.whatsappNumber ? 'bottom-24 md:bottom-24 right-6' : 'bottom-6 right-6'
          }`}
          aria-label="Back to top"
          title="Back to top"
        >
          <FaChevronUp />
        </button>
      )}

      {/* Spacer for mobile bottom bar */}
      <div className="h-14 md:hidden" />
    </>
  );
}
