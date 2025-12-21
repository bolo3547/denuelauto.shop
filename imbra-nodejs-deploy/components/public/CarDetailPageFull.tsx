"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaHeart, FaWhatsapp, FaPhone, FaEnvelope, FaShare,
  FaChevronLeft, FaChevronRight, FaCalculator, FaCheck,
  FaCar, FaMapMarkerAlt, FaPrint, FaDownload, FaExchangeAlt
} from 'react-icons/fa';
import BeForwardHeader from '@/components/public/BeForwardHeader';
import BeForwardFooter from '@/components/public/BeForwardFooter';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  grade?: string;
  year: number;
  mileageKm: number;
  engineCc?: number;
  transmission: string;
  fuel: string;
  steering?: string;
  drive?: string;
  seats?: number;
  doors?: number;
  priceUsd?: number;
  priceLocal?: number;
  status: string;
  location: string;
  bodyType?: string;
  color?: string;
  vin?: string;
  images: string[];
  features?: string[];
  description?: string;
}

interface CarDetailPageProps {
  tenantSlug: string;
  car: Car;
  relatedCars?: Car[];
  tenant?: any;
}

export default function CarDetailPage({ tenantSlug, car, relatedCars = [], tenant }: CarDetailPageProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currency, setCurrency] = useState('ZMW');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  
  // Financing calculator state
  const [financeCalc, setFinanceCalc] = useState({
    deposit: Math.round((car.priceLocal || 0) * 0.3),
    months: 36,
    rate: 18,
  });

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);
    
    const favs = localStorage.getItem(`favs:${tenantSlug}`);
    if (favs) {
      const parsed = JSON.parse(favs);
      setIsFavorite(parsed.includes(car.id || car.stockNo));
    }
  }, [tenantSlug, car.id, car.stockNo]);

  const toggleFavorite = () => {
    const key = `favs:${tenantSlug}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    const carId = car.id || car.stockNo;
    
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== carId);
      localStorage.setItem(key, JSON.stringify(newFavs));
    } else {
      favs.push(carId);
      localStorage.setItem(key, JSON.stringify(favs));
    }
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') {
      return `K${price.toLocaleString()}`;
    }
    return `$${Math.round(price / 27).toLocaleString()}`;
  };

  // Calculate monthly payment
  const calculateMonthly = () => {
    const principal = (car.priceLocal || 0) - financeCalc.deposit;
    const monthlyRate = financeCalc.rate / 100 / 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, financeCalc.months)) /
      (Math.pow(1 + monthlyRate, financeCalc.months) - 1);
    return Math.round(payment);
  };

  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-700 border-green-200',
    'Reserved': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Sold': 'bg-red-100 text-red-700 border-red-200',
  };

  const specs = [
    { label: 'Year', value: car.year },
    { label: 'Mileage', value: `${car.mileageKm?.toLocaleString()} km` },
    { label: 'Engine', value: car.engineCc ? `${car.engineCc}cc` : '-' },
    { label: 'Transmission', value: car.transmission },
    { label: 'Fuel', value: car.fuel },
    { label: 'Steering', value: car.steering || 'Right Hand' },
    { label: 'Drive', value: car.drive || '4WD' },
    { label: 'Body Type', value: car.bodyType || '-' },
    { label: 'Color', value: car.color || '-' },
    { label: 'Seats', value: car.seats || '-' },
    { label: 'Doors', value: car.doors || '-' },
    { label: 'Location', value: car.location },
  ];

  const defaultFeatures = [
    'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
    'ABS Brakes', 'Airbags', 'Alloy Wheels', 'Reverse Camera'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href={`/t/${tenantSlug}`} className="text-gray-500 hover:text-blue-600">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/t/${tenantSlug}/stock`} className="text-gray-500 hover:text-blue-600">Stock</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{car.make} {car.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-[16/10]">
                <img
                  src={car.images[selectedImage] || '/placeholder-car.jpg'}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => prev === 0 ? car.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => prev === car.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                      aria-label="Next image"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                {/* Status Badge */}
                <span className={`absolute top-4 left-4 px-3 py-1.5 text-sm font-medium rounded-full border ${statusColors[car.status]}`}>
                  {car.status}
                </span>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
                    }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <FaHeart />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${car.make} ${car.model} ${car.year}`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white text-gray-600 rounded-full flex items-center justify-center hover:text-blue-500"
                    aria-label="Share"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {car.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                        idx === selectedImage ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price (Mobile) */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">Stock# {car.stockNo}</div>
              <h1 className="text-xl font-bold text-gray-900">
                {car.make} {car.model} {car.grade || ''}
              </h1>
              <div className="mt-3">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(car.priceLocal || 0)}
                </div>
                {currency === 'ZMW' && car.priceUsd && (
                  <div className="text-sm text-gray-500">≈ ${car.priceUsd.toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="font-medium text-gray-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(car.features || defaultFeatures).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
              </div>
            )}
          </div>

          {/* Right: Price & Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="hidden lg:block">
                <div className="text-sm text-gray-500 mb-1">Stock# {car.stockNo}</div>
                <h1 className="text-xl font-bold text-gray-900 mb-4">
                  {car.make} {car.model} {car.grade || ''}
                </h1>
              </div>

              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(car.priceLocal || 0)}
              </div>
              {currency === 'ZMW' && car.priceUsd && (
                <div className="text-sm text-gray-500 mb-4">≈ ${car.priceUsd.toLocaleString()} USD</div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${tenant?.whatsapp?.replace(/\D/g, '') || '260973914432'}?text=${encodeURIComponent(`Hi! I'm interested in ${car.make} ${car.model} (Stock# ${car.stockNo})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  <FaWhatsapp className="text-xl" />
                  Inquire on WhatsApp
                </a>
                
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaEnvelope />
                  Send Inquiry
                </button>

                <a
                  href={`tel:${tenant?.phone || '+260973914432'}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaPhone />
                  Call Us
                </a>
              </div>

              {/* Location */}
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt />
                <span>Location: {car.location}</span>
              </div>
            </div>

            {/* Financing Calculator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalculator className="text-blue-600" />
                Financing Calculator
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Deposit ({Math.round((financeCalc.deposit / (car.priceLocal || 1)) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={Math.round((car.priceLocal || 0) * 0.1)}
                    max={Math.round((car.priceLocal || 0) * 0.7)}
                    step={10000}
                    value={financeCalc.deposit}
                    onChange={(e) => setFinanceCalc({ ...financeCalc, deposit: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-right text-sm font-medium text-gray-900">
                    {formatPrice(financeCalc.deposit)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duration</label>
                  <select
                    value={financeCalc.months}
                    onChange={(e) => setFinanceCalc({ ...financeCalc, months: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value={12}>12 months</option>
                    <option value={24}>24 months</option>
                    <option value={36}>36 months</option>
                    <option value={48}>48 months</option>
                    <option value={60}>60 months</option>
                  </select>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">Estimated Monthly Payment</p>
                  <p className="text-2xl font-bold text-blue-700">{formatPrice(calculateMonthly())}</p>
                  <p className="text-xs text-blue-500 mt-1">*Subject to approval</p>
                </div>

                <Link
                  href={`/t/${tenantSlug}/financing?stockNo=${car.stockNo}`}
                  className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Apply for Financing
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <FaPrint /> Print
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <FaDownload /> PDF
              </button>
              <Link
                href={`/t/${tenantSlug}/compare?ids=${car.id || car.stockNo}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                <FaExchangeAlt /> Compare
              </Link>
            </div>
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedCars.slice(0, 4).map((relatedCar) => (
                <Link
                  key={relatedCar.id}
                  href={`/t/${tenantSlug}/stock/${relatedCar.stockNo}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={relatedCar.images[0] || '/placeholder-car.jpg'}
                      alt={`${relatedCar.make} ${relatedCar.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {relatedCar.make} {relatedCar.model}
                    </h3>
                    <p className="text-xs text-gray-500">{relatedCar.year} • {relatedCar.mileageKm?.toLocaleString()} km</p>
                    <p className="text-blue-600 font-bold mt-1">{formatPrice(relatedCar.priceLocal || 0)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Inquiry Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Inquiry</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full border rounded-lg px-3 py-2" placeholder="+260 9X XXX XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border rounded-lg px-3 py-2" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  defaultValue={`I'm interested in ${car.make} ${car.model} (Stock# ${car.stockNo})`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />
    </div>
  );
}
