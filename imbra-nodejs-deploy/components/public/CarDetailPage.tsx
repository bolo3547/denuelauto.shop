"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaHeart, FaWhatsapp, FaPhone, FaShare, FaPrint,
  FaChevronLeft, FaChevronRight, FaCalculator, FaShieldAlt,
  FaMapMarkerAlt, FaTachometerAlt, FaCog, FaGasPump, FaCar,
  FaCalendarAlt, FaPalette, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import BeForwardHeader from './BeForwardHeader';
import BeForwardFooter from './BeForwardFooter';

interface CarDetailPageProps {
  tenantSlug: string;
  tenant?: any;
  car: any;
  relatedCars?: any[];
}

export default function CarDetailPage({ tenantSlug, tenant, car, relatedCars = [] }: CarDetailPageProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currency, setCurrency] = useState('ZMW');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  
  // Financing calculator state
  const [deposit, setDeposit] = useState(30);
  const [months, setMonths] = useState(36);
  const [interestRate] = useState(18);

  const images = car?.images || ['/placeholder-car.jpg'];

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);

    const favs = JSON.parse(localStorage.getItem(`favs:${tenantSlug}`) || '[]');
    setIsFavorite(favs.includes(car?.id || car?.stockNo));
  }, [tenantSlug, car]);

  const toggleFavorite = () => {
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const carId = car?.id || car?.stockNo;
    const newFavs = isFavorite ? favs.filter((id: string) => id !== carId) : [...favs, carId];
    localStorage.setItem(key, JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  // Calculate monthly payment
  const calculateMonthly = () => {
    const price = car?.priceUsd || 0;
    const depositAmount = (price * deposit) / 100;
    const principal = price - depositAmount;
    const monthlyRate = interestRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const monthlyPayment = calculateMonthly();

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800 border-green-200',
    'Reserved': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Sold': 'bg-red-100 text-red-800 border-red-200',
    'In-Transit': 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const specs = [
    { icon: FaCalendarAlt, label: 'Year', value: car?.year },
    { icon: FaTachometerAlt, label: 'Mileage', value: `${car?.mileageKm?.toLocaleString() || 0} km` },
    { icon: FaCog, label: 'Transmission', value: car?.transmission },
    { icon: FaGasPump, label: 'Fuel', value: car?.fuel },
    { icon: FaCar, label: 'Body Type', value: car?.bodyType },
    { icon: FaPalette, label: 'Color', value: car?.color || 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link href={`/t/${tenantSlug}`} className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={`/t/${tenantSlug}/stock`} className="hover:text-blue-600">Stock</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{car?.make} {car?.model}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="relative aspect-[16/10]">
                <img
                  src={images[currentImageIndex]}
                  alt={`${car?.make} ${car?.model}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-lg"
                    >
                      <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-lg"
                    >
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Status Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg border font-medium ${statusColors[car?.status] || 'bg-gray-100'}`}>
                  {car?.status}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white rounded-lg text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                          idx === currentImageIndex ? 'border-blue-600' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <spec.icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">{spec.label}</div>
                      <div className="font-medium text-gray-900">{spec.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Specs Table */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Full Specifications</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stock No.</span>
                    <span className="font-medium">{car?.stockNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Make</span>
                    <span className="font-medium">{car?.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model</span>
                    <span className="font-medium">{car?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grade</span>
                    <span className="font-medium">{car?.grade || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engine</span>
                    <span className="font-medium">{car?.engineCc ? `${car.engineCc}cc` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Steering</span>
                    <span className="font-medium">{car?.steering || 'RHD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Drive</span>
                    <span className="font-medium">{car?.drive || '4WD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-medium">{car?.seats || '5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doors</span>
                    <span className="font-medium">{car?.doors || '5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{car?.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features (if available) */}
            {car?.features && car.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Equipment</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <FaCheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Stock# {car?.stockNo}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-lg border ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <FaHeart className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50" title="Share">
                    <FaShare className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50" title="Print">
                    <FaPrint className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {car?.make} {car?.model} {car?.grade || ''}
              </h1>
              <p className="text-sm text-gray-600 mb-4">{car?.year} • {car?.mileageKm?.toLocaleString()}km</p>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatPrice(car?.priceUsd || 0)}
                </div>
                {currency === 'ZMW' && (
                  <div className="text-sm text-gray-500">≈ ${car?.priceUsd?.toLocaleString()} USD</div>
                )}
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                  <FaCalculator className="w-4 h-4" />
                  Estimated Monthly: {formatPrice(monthlyPayment)} /month
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Based on {deposit}% deposit, {months} months @ {interestRate}% p.a.
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Inquiry
              </button>
              
              <a
                href={`https://wa.me/${(tenant?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${car?.make} ${car?.model} (Stock# ${car?.stockNo}). Is it still available?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5" />
                Chat on WhatsApp
              </a>

              {tenant?.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPhone className="w-4 h-4" />
                  Call: {tenant.phone}
                </a>
              )}
            </div>

            {/* Financing Calculator */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalculator className="w-4 h-4 text-blue-600" />
                Financing Calculator
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Deposit: {deposit}%</label>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    value={deposit}
                    onChange={(e) => setDeposit(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>70%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duration: {months} months</label>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    step="6"
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>6 mo</span>
                    <span>60 mo</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Car Price</span>
                    <span className="font-medium">{formatPrice(car?.priceUsd || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Deposit ({deposit}%)</span>
                    <span className="font-medium">{formatPrice((car?.priceUsd || 0) * deposit / 100)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Amount to Finance</span>
                    <span className="font-medium">{formatPrice((car?.priceUsd || 0) * (100 - deposit) / 100)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-gray-200">
                    <span>Monthly Payment</span>
                    <span>{formatPrice(monthlyPayment)}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/t/${tenantSlug}/financing?car=${car?.stockNo}`}
                className="mt-4 block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                Apply for Financing
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="w-4 h-4 text-blue-600" />
                Why Buy With Us
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified dealer with 500+ happy customers</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  <span>Flexible financing options available</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  <span>3-month warranty on selected vehicles</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  <span>We handle all RTSA paperwork</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                Vehicle Location
              </h3>
              <p className="text-gray-600">{car?.location || 'Lusaka Showroom'}</p>
              <p className="text-sm text-gray-500 mt-1">{tenant?.location}</p>
              <Link
                href={`/t/${tenantSlug}/branches`}
                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                View all branches →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCars.slice(0, 4).map((relCar: any) => (
                <Link
                  key={relCar.id || relCar.stockNo}
                  href={`/t/${tenantSlug}/stock/${relCar.stockNo || relCar.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={relCar.images?.[0] || '/placeholder-car.jpg'}
                      alt={`${relCar.make} ${relCar.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 truncate">
                      {relCar.make} {relCar.model}
                    </h3>
                    <p className="text-sm text-gray-600">{relCar.year} • {relCar.mileageKm?.toLocaleString()}km</p>
                    <p className="text-blue-600 font-bold mt-1">{formatPrice(relCar.priceUsd || 0)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <InquiryModal
          car={car}
          tenantSlug={tenantSlug}
          tenant={tenant}
          onClose={() => setShowInquiryForm(false)}
        />
      )}

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />
    </div>
  );
}

// Inquiry Modal Component
function InquiryModal({ car, tenantSlug, tenant, onClose }: any) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in the ${car?.make} ${car?.model} (Stock# ${car?.stockNo}). Please provide more information.`,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Send Inquiry</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiry Sent!</h3>
              <p className="text-gray-600 mb-4">We'll get back to you within 24 hours.</p>
              <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Inquiring about:</p>
                <p className="font-medium">{car?.make} {car?.model} - Stock# {car?.stockNo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (WhatsApp preferred)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+260 97 XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
