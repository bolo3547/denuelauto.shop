'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaFileAlt, 
  FaShip,
  FaArrowRight
} from 'react-icons/fa';
import { useTenantTheme } from '../../tenant/TenantThemeProvider';

interface Step {
  icon: React.ReactNode;
  number: number;
  title: string;
  description: string;
}

const defaultSteps: Step[] = [
  {
    icon: <FaSearch className="text-2xl" />,
    number: 1,
    title: 'Search & Compare',
    description: 'Browse our inventory of quality used vehicles. Use filters to find your perfect car, compare options, and check prices.',
  },
  {
    icon: <FaShoppingCart className="text-2xl" />,
    number: 2,
    title: 'Reserve Your Car',
    description: 'Found your car? Reserve it with a small deposit. This holds the vehicle exclusively for you while we prepare paperwork.',
  },
  {
    icon: <FaFileAlt className="text-2xl" />,
    number: 3,
    title: 'Complete Payment',
    description: 'Choose from multiple payment options including bank transfer, mobile money, or financing. We handle all export documentation.',
  },
  {
    icon: <FaShip className="text-2xl" />,
    number: 4,
    title: 'Receive Your Car',
    description: 'Track your shipment in real-time. We deliver to your nearest port or door-to-door. Full support until delivery.',
  },
];

export default function HowToBuySteps() {
  const { settings } = useTenantTheme();
  const tenantSlug = settings?.tenantSlug || 'default';
  const steps = defaultSteps;

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">
            How to Buy a Car
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Purchasing your dream car is simple with our 4-step process. 
            We guide you every step of the way.
          </p>
        </div>

        {/* Desktop Timeline View */}
        <div className="hidden md:block relative">
          {/* Connection line */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200 z-0">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-1000"
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-4 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center group">
                {/* Step circle */}
                <div className="relative inline-block mb-6">
                  <div 
                    className="w-16 h-16 rounded-full bg-white border-4 border-[var(--accent)] 
                             flex items-center justify-center shadow-lg group-hover:bg-[var(--accent)] 
                             group-hover:text-white transition-all duration-300"
                  >
                    <span className="font-bold text-xl text-[var(--accent)] group-hover:text-white">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--border)] 
                              hover:shadow-md hover:border-[var(--accent)]/30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center 
                                justify-center mx-auto mb-3 text-[var(--accent)]">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text)] mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-[var(--border)]"
            >
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full bg-[var(--accent)] text-white 
                           flex items-center justify-center font-bold text-lg"
                >
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[var(--text)] mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href={`/t/${tenantSlug}/help/how-to-buy`}
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-white 
                     px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Read Full Guide
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
