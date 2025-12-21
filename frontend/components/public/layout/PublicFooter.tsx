'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt,
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn,
  FaChevronRight, FaCar, FaQuestionCircle, FaCreditCard,
  FaFileAlt, FaHeadset, FaShieldAlt, FaNewspaper, FaStar
} from 'react-icons/fa';
import { useTenantTheme } from '../tenant';

interface PublicFooterProps {
  tenantSlug: string;
}

export default function PublicFooter({ tenantSlug }: PublicFooterProps) {
  const { settings } = useTenantTheme();

  const openWhatsApp = () => {
    const phone = settings.support.whatsappNumber;
    if (!phone) return;
    const text = encodeURIComponent(`Hello ${settings.tenantName}, I have a question.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // Footer link columns
  const howToBuyLinks = [
    { label: 'How to Buy', href: `/t/${tenantSlug}/help/how-to-buy` },
    { label: 'Payment Methods', href: `/t/${tenantSlug}/help/how-to-pay` },
    { label: 'Shipping Guide', href: `/t/${tenantSlug}/help/shipping` },
    { label: 'Insurance Options', href: `/t/${tenantSlug}/help/insurance` },
    { label: 'Financing', href: `/t/${tenantSlug}/financing` },
    { label: 'Trade-In', href: `/t/${tenantSlug}/trade-in` },
  ];

  const helpLinks = [
    { label: 'FAQ', href: `/t/${tenantSlug}/help/faq` },
    { label: 'Contact Us', href: `/t/${tenantSlug}/contact` },
    { label: 'Our Locations', href: `/t/${tenantSlug}/locations` },
    { label: 'Support Center', href: `/t/${tenantSlug}/help` },
    { label: 'Track My Order', href: `/t/${tenantSlug}/account/orders` },
    { label: 'Submit Inquiry', href: `/t/${tenantSlug}/inquiry` },
  ];

  const companyLinks = [
    { label: 'About Us', href: `/t/${tenantSlug}/about` },
    { label: 'Why Choose Us', href: `/t/${tenantSlug}/why-choose-us` },
    { label: 'Testimonials', href: `/t/${tenantSlug}/testimonials` },
    { label: 'Terms & Conditions', href: `/t/${tenantSlug}/terms` },
    { label: 'Privacy Policy', href: `/t/${tenantSlug}/privacy` },
    { label: 'Careers', href: `/t/${tenantSlug}/careers` },
  ];

  const extraLinks = [
    { label: 'Blog', href: `/t/${tenantSlug}/blog` },
    { label: 'News & Updates', href: `/t/${tenantSlug}/news` },
    { label: 'Customer Reviews', href: `/t/${tenantSlug}/reviews` },
    { label: 'Partner with Us', href: `/t/${tenantSlug}/partner` },
    { label: 'Sell Your Car', href: `/t/${tenantSlug}/sell` },
  ];

  const popularMakes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Suzuki', 'Mercedes-Benz', 'BMW'];
  const popularTypes = ['SUV', 'Sedan', 'Pickup', 'Hatchback', 'Van', 'Wagon'];

  const socialLinks = [
    { icon: FaFacebookF, href: settings.socialLinks?.facebook, label: 'Facebook' },
    { icon: FaTwitter, href: settings.socialLinks?.twitter, label: 'Twitter' },
    { icon: FaInstagram, href: settings.socialLinks?.instagram, label: 'Instagram' },
    { icon: FaYoutube, href: settings.socialLinks?.youtube, label: 'YouTube' },
    { icon: FaLinkedinIn, href: settings.socialLinks?.linkedin, label: 'LinkedIn' },
  ].filter(link => link.href);

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Column 1: How to Buy */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaCar className="text-[var(--accent)]" />
              How to Buy
            </h3>
            <ul className="space-y-2">
              {howToBuyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Help & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaHeadset className="text-[var(--accent)]" />
              Help & Support
            </h3>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-[var(--accent)]" />
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Extra */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaNewspaper className="text-[var(--accent)]" />
              More
            </h3>
            <ul className="space-y-2">
              {extraLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Popular Makes */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Makes</h3>
            <ul className="space-y-2">
              {popularMakes.map((make) => (
                <li key={make}>
                  <Link
                    href={`/t/${tenantSlug}/stock?make=${encodeURIComponent(make)}`}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {make}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Body Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">Body Types</h3>
            <ul className="space-y-2">
              {popularTypes.map((type) => (
                <li key={type}>
                  <Link
                    href={`/t/${tenantSlug}/stock?bodyType=${encodeURIComponent(type)}`}
                    className="text-sm hover:text-white hover:underline transition-colors"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact & Social Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tenant Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.logoAlt || `${settings.tenantName} logo`}
                    className="h-10 w-auto object-contain brightness-200"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">{settings.tenantName}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Your trusted source for quality used vehicles. We offer competitive prices, 
                flexible financing, and excellent customer service.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                {settings.address && (
                  <li className="flex items-start gap-2 text-sm">
                    <FaMapMarkerAlt className="text-[var(--accent)] mt-1 flex-shrink-0" />
                    <span>{settings.address}</span>
                  </li>
                )}
                {settings.support.phone && (
                  <li>
                    <a
                      href={`tel:${settings.support.phone}`}
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                    >
                      <FaPhone className="text-[var(--accent)]" />
                      <span>{settings.support.phone}</span>
                    </a>
                  </li>
                )}
                {settings.support.phone2 && (
                  <li>
                    <a
                      href={`tel:${settings.support.phone2}`}
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                    >
                      <FaPhone className="text-[var(--accent)]" />
                      <span>{settings.support.phone2}</span>
                    </a>
                  </li>
                )}
                {settings.support.email && (
                  <li>
                    <a
                      href={`mailto:${settings.support.email}`}
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                    >
                      <FaEnvelope className="text-[var(--accent)]" />
                      <span>{settings.support.email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* WhatsApp CTA */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Inquiry</h4>
              {settings.support.whatsappNumber && (
                <button
                  onClick={openWhatsApp}
                  className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full justify-center"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>Chat on WhatsApp</span>
                </button>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Available 24/7 for your inquiries
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-[var(--accent)] rounded-full flex items-center justify-center transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              )}
              {/* Newsletter signup teaser */}
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Get the latest deals</p>
                <Link
                  href={`/t/${tenantSlug}/newsletter`}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Subscribe to newsletter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} {settings.tenantName}. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/t/${tenantSlug}/terms`} className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href={`/t/${tenantSlug}/privacy`} className="hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1">
                Powered by <a href="https://denuelauto.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Denuel Auto</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
