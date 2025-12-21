'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaQuestionCircle, 
  FaShip, 
  FaMoneyBillWave, 
  FaFileAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowRight
} from 'react-icons/fa';
import { useTenantTheme } from '../../tenant/TenantThemeProvider';

interface HelpCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

export default function HelpCards() {
  const { settings } = useTenantTheme();
  const tenantSlug = settings?.tenantSlug || 'default';

  const helpCards: HelpCard[] = [
    {
      icon: <FaQuestionCircle className="text-2xl" />,
      title: 'FAQs',
      description: 'Find answers to common questions about buying, shipping, and payments.',
      href: `/t/${tenantSlug}/help/faq`,
      color: 'bg-blue-500',
    },
    {
      icon: <FaShip className="text-2xl" />,
      title: 'Shipping Guide',
      description: 'Learn about shipping times, costs, and delivery options to your country.',
      href: `/t/${tenantSlug}/help/shipping`,
      color: 'bg-teal-500',
    },
    {
      icon: <FaMoneyBillWave className="text-2xl" />,
      title: 'Payment Methods',
      description: 'Explore secure payment options including bank transfer and mobile money.',
      href: `/t/${tenantSlug}/help/payments`,
      color: 'bg-green-500',
    },
    {
      icon: <FaFileAlt className="text-2xl" />,
      title: 'Documentation',
      description: 'Understand export papers, customs clearance, and registration requirements.',
      href: `/t/${tenantSlug}/help/documents`,
      color: 'bg-purple-500',
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: 'Our Locations',
      description: 'Find our yards, offices, and partner locations near you.',
      href: `/t/${tenantSlug}/locations`,
      color: 'bg-red-500',
    },
    {
      icon: <FaPhone className="text-2xl" />,
      title: 'Contact Us',
      description: 'Get in touch with our support team via phone, email, or WhatsApp.',
      href: `/t/${tenantSlug}/contact`,
      color: 'bg-orange-500',
    },
  ];

  return (
    <section className="py-12 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">
            Need Help?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to assist you at every step. Browse our help resources or contact our team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-[var(--border)] 
                       hover:shadow-md hover:border-[var(--accent)]/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center 
                            justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-lg text-[var(--text)] mb-2 group-hover:text-[var(--accent)] 
                           transition-colors flex items-center gap-2">
                {card.title}
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-sm" />
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Support banner */}
        <div className="mt-10 bg-gradient-to-r from-[var(--primary)] to-gray-800 rounded-xl p-6 
                       md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
            <p className="text-white/80">
              Our support team is available 24/7 to help you with any questions.
            </p>
          </div>
          <div className="flex gap-4">
            {settings?.support?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.support.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg 
                         font-semibold transition-colors flex items-center gap-2"
              >
                WhatsApp Us
              </a>
            )}
            <Link
              href={`/t/${tenantSlug}/contact`}
              className="bg-white text-[var(--primary)] px-6 py-3 rounded-lg font-semibold 
                       hover:bg-gray-100 transition-colors"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
