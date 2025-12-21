import React from 'react';
import Link from 'next/link';
import { trackEvent } from '@/utils/analytics';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Car, Shield, Award, Truck } from 'lucide-react';
import { tenantTheme as defaultTheme } from '../lib/tenantMock';
import { useTenantTheme } from '@/contexts/TenantThemeContext';

export default function DealerFooter({ theme }: { theme?: any }) {
  const ctx = useTenantTheme();
  const effectiveTheme = theme || ctx.theme || defaultTheme;
  const tone = (effectiveTheme?.brandTone || 'professional') as string;
  const tagline = tone === 'formal' ? 'Comprehensive documentation and professional export services, compliant with regulations.' : tone === 'friendly' ? 'Friendly service, transparent pricing, and hassle-free export — we’re here to help!' : 'Your trusted source for quality Japanese used cars. Professional export services with full documentation and worldwide shipping.';

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Car className="w-8 h-8 text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">{effectiveTheme?.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {tagline}
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-blue-600" />
                <span>{effectiveTheme?.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-blue-600" />
                <span>{effectiveTheme?.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-blue-600" />
                <span>{effectiveTheme?.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <span className="text-sm font-medium text-gray-700">Follow us:</span>
              <div className="flex space-x-3">
                <a href="#" aria-label="Facebook" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Twitter" className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Instagram" className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" aria-label="YouTube" className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Inventory</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/stock" onClick={() => trackEvent('footer_link_click', { label: 'Browse All Cars', href: '/stock' })} className="text-gray-600 hover:text-blue-600 transition-colors">Browse All Cars</Link></li>
              <li><Link href="/stock?bodyType=SUV" onClick={() => trackEvent('footer_link_click', { label: 'SUVs', href: '/stock?bodyType=SUV' })} className="text-gray-600 hover:text-blue-600 transition-colors">SUVs</Link></li>
              <li><Link href="/stock?bodyType=Sedan" onClick={() => trackEvent('footer_link_click', { label: 'Sedans', href: '/stock?bodyType=Sedan' })} className="text-gray-600 hover:text-blue-600 transition-colors">Sedans</Link></li>
              <li><Link href="/stock?make=Toyota" onClick={() => trackEvent('footer_link_click', { label: 'Toyota', href: '/stock?make=Toyota' })} className="text-gray-600 hover:text-blue-600 transition-colors">Toyota</Link></li>
              <li><Link href="/stock?make=Honda" onClick={() => trackEvent('footer_link_click', { label: 'Honda', href: '/stock?make=Honda' })} className="text-gray-600 hover:text-blue-600 transition-colors">Honda</Link></li>
              <li><Link href="/stock?maxPrice=10000" onClick={() => trackEvent('footer_link_click', { label: 'Under $10K', href: '/stock?maxPrice=10000' })} className="text-gray-600 hover:text-blue-600 transition-colors">Under $10K</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/dealer-template/vehicle-inspection" onClick={() => trackEvent('footer_link_click', { label: 'Vehicle Inspection', href: '/dealer-template/vehicle-inspection' })} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"><Shield className="w-4 h-4 mr-2 text-green-600" />Vehicle Inspection</Link></li>
              <li><Link href="/dealer-template/shipping-logistics" onClick={() => trackEvent('footer_link_click', { label: 'Shipping & Logistics', href: '/dealer-template/shipping-logistics' })} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"><Truck className="w-4 h-4 mr-2 text-blue-600" />Shipping & Logistics</Link></li>
              <li><Link href="/dealer-template/export-documentation" onClick={() => trackEvent('footer_link_click', { label: 'Export Documentation', href: '/dealer-template/export-documentation' })} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"><Award className="w-4 h-4 mr-2 text-yellow-600" />Export Documentation</Link></li>
              <li><Link href="/dealer-template/how-to-buy" onClick={() => trackEvent('footer_link_click', { label: 'How to Buy', href: '/dealer-template/how-to-buy' })} className="text-gray-600 hover:text-blue-600 transition-colors">How to Buy</Link></li>
              <li><Link href="/dealer-template/contact" onClick={() => trackEvent('footer_link_click', { label: 'Contact Us', href: '/dealer-template/contact' })} className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Customer Service</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/dealer-template/favorites" onClick={() => trackEvent('footer_link_click', { label: 'My Favorites', href: '/dealer-template/favorites' })} className="text-gray-600 hover:text-blue-600 transition-colors">My Favorites</Link></li>
              <li><Link href="/dealer-template/compare" onClick={() => trackEvent('footer_link_click', { label: 'Compare Cars', href: '/dealer-template/compare' })} className="text-gray-600 hover:text-blue-600 transition-colors">Compare Cars</Link></li>
              <li><Link href="/dealer-template/faq" onClick={() => trackEvent('footer_link_click', { label: 'FAQ', href: '/dealer-template/faq' })} className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link></li>
              <li><Link href="/dealer-template/customer-service" onClick={() => trackEvent('footer_link_click', { label: 'Customer Service', href: '/dealer-template/customer-service' })} className="text-gray-600 hover:text-blue-600 transition-colors">Customer Service</Link></li>
              <li><Link href="/dealer-template/shipping-guide" onClick={() => trackEvent('footer_link_click', { label: 'Shipping Guide', href: '/dealer-template/shipping-guide' })} className="text-gray-600 hover:text-blue-600 transition-colors">Shipping Guide</Link></li>
              <li><Link href="/dealer-template/payment-options" onClick={() => trackEvent('footer_link_click', { label: 'Payment Options', href: '/dealer-template/payment-options' })} className="text-gray-600 hover:text-blue-600 transition-colors">Payment Options</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-2 text-gray-900">Stay Updated with New Arrivals</h4>
            <p className="text-gray-600 mb-6">Get the latest deals and new Japanese used cars in your inbox</p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium text-white transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              <span>Licensed Exporter</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              <span>Quality Assured</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="w-5 h-5 mr-2 text-yellow-600" />
              <span>Worldwide Shipping</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>Since 2010</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4 md:mb-0">
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Use</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Site Map</Link>
            </div>
              <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} {effectiveTheme?.name}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
