"use client";
import React from 'react';
import Link from 'next/link';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin,
  FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt,
  FaCreditCard, FaMobileAlt, FaUniversity
} from 'react-icons/fa';

interface BeForwardFooterProps {
  tenantSlug: string;
  tenant?: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    location?: string;
    primaryColor?: string;
  };
}

export default function BeForwardFooter({ tenantSlug, tenant }: BeForwardFooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: `/t/${tenantSlug}/about` },
      { label: 'Our Team', href: `/t/${tenantSlug}/team` },
      { label: 'Careers', href: `/t/${tenantSlug}/careers` },
      { label: 'Branches', href: `/t/${tenantSlug}/branches` },
      { label: 'News & Updates', href: `/t/${tenantSlug}/news` },
    ],
    buying: [
      { label: 'How to Buy', href: `/t/${tenantSlug}/how-to-buy` },
      { label: 'Financing Options', href: `/t/${tenantSlug}/financing` },
      { label: 'Trade-In', href: `/t/${tenantSlug}/trade-in` },
      { label: 'Shipping & Delivery', href: `/t/${tenantSlug}/shipping` },
      { label: 'Vehicle Inspection', href: `/t/${tenantSlug}/inspection` },
    ],
    help: [
      { label: 'FAQs', href: `/t/${tenantSlug}/faq` },
      { label: 'Contact Us', href: `/t/${tenantSlug}/contact` },
      { label: 'Support Center', href: `/t/${tenantSlug}/support` },
      { label: 'Track My Order', href: `/t/${tenantSlug}/track` },
      { label: 'Warranty Policy', href: `/t/${tenantSlug}/warranty` },
    ],
    legal: [
      { label: 'Terms of Service', href: `/t/${tenantSlug}/terms` },
      { label: 'Privacy Policy', href: `/t/${tenantSlug}/privacy` },
      { label: 'Return Policy', href: `/t/${tenantSlug}/returns` },
      { label: 'Cookie Policy', href: `/t/${tenantSlug}/cookies` },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4">{tenant?.name || 'Denuel Auto'}</h3>
            <p className="text-sm mb-4 text-gray-400">
              Your trusted partner for quality vehicles in Zambia. We offer the best selection of cars with flexible financing options.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {tenant?.location && (
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="w-4 h-4 mt-0.5 text-blue-400" />
                  <span>{tenant.location}</span>
                </div>
              )}
              {tenant?.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <FaPhone className="w-4 h-4 text-blue-400" />
                  <span>{tenant.phone}</span>
                </a>
              )}
              {tenant?.whatsapp && (
                <a 
                  href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp Us</span>
                </a>
              )}
              {tenant?.email && (
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <FaEnvelope className="w-4 h-4 text-blue-400" />
                  <span>{tenant.email}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors" aria-label="Facebook">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors" aria-label="Twitter">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors" aria-label="Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" aria-label="YouTube">
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Buying Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Buying Guide</h4>
            <ul className="space-y-2">
              {footerLinks.buying.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help & Support</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">We Accept</h4>
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs flex items-center gap-1">
                  <FaMobileAlt className="w-3 h-3" />
                  <span>Airtel Money</span>
                </div>
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs flex items-center gap-1">
                  <FaMobileAlt className="w-3 h-3" />
                  <span>MTN MoMo</span>
                </div>
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs flex items-center gap-1">
                  <FaUniversity className="w-3 h-3" />
                  <span>Bank Transfer</span>
                </div>
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs flex items-center gap-1">
                  <FaCreditCard className="w-3 h-3" />
                  <span>Visa/Mastercard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} {tenant?.name || 'Denuel Auto'}. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Powered by <span className="text-blue-400">Denuel Auto Platform</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
