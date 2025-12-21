'use client';

import React from 'react';
import { 
  FaShieldAlt, 
  FaTruck, 
  FaHeadset, 
  FaDollarSign, 
  FaFileAlt, 
  FaClock,
  FaGlobe,
  FaCertificate
} from 'react-icons/fa';
import { useTenantTheme } from '../../tenant/TenantThemeProvider';

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const defaultTrustItems: TrustItem[] = [
  {
    icon: <FaShieldAlt className="text-3xl" />,
    title: 'Quality Guaranteed',
    description: 'Every vehicle undergoes rigorous 150-point inspection before listing',
  },
  {
    icon: <FaTruck className="text-3xl" />,
    title: 'Worldwide Shipping',
    description: 'We ship to over 50 countries with door-to-door delivery options',
  },
  {
    icon: <FaHeadset className="text-3xl" />,
    title: '24/7 Support',
    description: 'Our multilingual team is available round the clock to assist you',
  },
  {
    icon: <FaDollarSign className="text-3xl" />,
    title: 'Best Prices',
    description: 'Competitive pricing with no hidden fees, price match guarantee',
  },
  {
    icon: <FaFileAlt className="text-3xl" />,
    title: 'Full Documentation',
    description: 'Complete export paperwork and customs clearance assistance',
  },
  {
    icon: <FaClock className="text-3xl" />,
    title: 'Fast Processing',
    description: 'Quick order processing with real-time shipment tracking',
  },
  {
    icon: <FaGlobe className="text-3xl" />,
    title: '20+ Years Experience',
    description: 'Trusted by millions of customers worldwide since 2004',
  },
  {
    icon: <FaCertificate className="text-3xl" />,
    title: 'Certified Seller',
    description: 'Licensed and registered vehicle exporter with A+ rating',
  },
];

export default function WhyChooseUs() {
  const { settings } = useTenantTheme();
  const trustItems: TrustItem[] = (settings?.homepageConfig as { trustItems?: TrustItem[] })?.trustItems || defaultTrustItems;
  const tenantName = settings?.tenantName || 'Our Company';

  return (
    <section className="py-12 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">
            Why Choose {tenantName}?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join millions of satisfied customers who trust us for quality vehicles, 
            competitive prices, and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.slice(0, 8).map((item: TrustItem, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow 
                       border border-[var(--border)] group"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center 
                            justify-center mb-4 text-[var(--accent)] group-hover:bg-[var(--accent)] 
                            group-hover:text-white transition-colors">
                {typeof item.icon === 'string' ? (
                  <span className="text-2xl">{item.icon}</span>
                ) : (
                  item.icon
                )}
              </div>
              <h3 className="font-bold text-lg text-[var(--text)] mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50,000+', label: 'Vehicles Sold' },
            { value: '150+', label: 'Countries Served' },
            { value: '98%', label: 'Customer Satisfaction' },
            { value: '20+', label: 'Years Experience' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 bg-white rounded-xl border border-[var(--border)]"
            >
              <div className="text-3xl font-bold text-[var(--accent)] mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
