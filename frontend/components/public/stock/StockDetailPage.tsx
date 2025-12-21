'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaRegHeart,
  FaExchangeAlt,
  FaShare,
  FaWhatsapp,
  FaPrint,
  FaDownload,
  FaTachometerAlt,
  FaGasPump,
  FaCogs,
  FaCar,
  FaCalendarAlt,
  FaPalette,
  FaMapMarkerAlt,
  FaRoad,
  FaCheck,
  FaInfoCircle,
  FaCalculator,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaExpand,
  FaShieldAlt,
  FaTruck,
  FaFileAlt,
  FaSpinner,
} from 'react-icons/fa';
import { useTenantTheme } from '../tenant';
import { addToRecentlyViewed } from '../home/sections/RecentlyViewedCars';

// =====================================================
// TYPES
// =====================================================
interface CarImage {
  id: string;
  url: string;
  caption?: string;
}

interface CarSpec {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  originalPrice?: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel: string;
  engineSize?: string;
  engineCode?: string;
  bodyType?: string;
  color?: string;
  interiorColor?: string;
  seats?: number;
  doors?: number;
  driveType?: string;
  steering?: string;
  vin?: string;
  grade?: string;
  location?: string;
  images: CarImage[] | string[];
  features?: string[];
  description?: string;
  createdAt?: string;
  isNew?: boolean;
  isHot?: boolean;
  isPriceDrop?: boolean;
  discountPercent?: number;
  fobPrice?: number;
  cifPrice?: number;
  shippingEstimate?: number;
  estimatedArrival?: string;
}

interface StockDetailPageProps {
  tenantSlug: string;
  car: Car;
  similarCars?: Car[];
}

// =====================================================
// IMAGE GALLERY
// =====================================================
function ImageGallery({ images, carTitle }: { images: (CarImage | string)[]; carTitle: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageUrls = images.map(img => typeof img === 'string' ? img : img.url);

  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % imageUrls.length);

  return (
    <>
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden group">
        <Image
          src={imageUrls[currentIndex] || '/images/car-placeholder.jpg'}
          alt={`${carTitle} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 
                       text-white rounded-full flex items-center justify-center transition-colors"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 
                       text-white rounded-full flex items-center justify-center transition-colors"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 w-10 h-10 bg-black/50 hover:bg-black/70 
                   text-white rounded-full flex items-center justify-center transition-colors opacity-0 
                   group-hover:opacity-100"
        >
          <FaExpand />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-3 py-1 rounded">
          {currentIndex + 1} / {imageUrls.length}
        </div>
      </div>

      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {imageUrls.slice(0, 8).map((url, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === currentIndex ? 'border-[var(--accent)]' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                width={80}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {imageUrls.length > 8 && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex-shrink-0 w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center 
                       text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              +{imageUrls.length - 8} more
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <span>{currentIndex + 1} / {imageUrls.length}</span>
            <button onClick={() => setIsFullscreen(false)} className="p-2 hover:bg-white/10 rounded-full">
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <Image
              src={imageUrls[currentIndex]}
              alt={`${carTitle} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
            <button
              onClick={goToPrev}
              className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 
                       text-white rounded-full flex items-center justify-center transition-colors"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 
                       text-white rounded-full flex items-center justify-center transition-colors"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
          <div className="p-4 flex gap-2 overflow-x-auto justify-center">
            {imageUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 ${
                  idx === currentIndex ? 'border-[var(--accent)]' : 'border-transparent'
                }`}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================
// INQUIRY MODAL
// =====================================================
function InquiryModal({ 
  car, 
  tenantSlug, 
  onClose 
}: { 
  car: Car; 
  tenantSlug: string; 
  onClose: () => void;
}) {
  const { settings } = useTenantTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: settings?.defaultCountry || '',
    message: `I am interested in ${car.year} ${car.make} ${car.model} (Stock No: ${car.stockNo}). Please provide more information.`,
    preferredContact: 'email',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/t/${tenantSlug}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stockNo: car.stockNo,
          carId: car.id,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Inquire About This Vehicle</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          {/* Car Summary */}
          <div className="flex gap-4 p-3 bg-gray-50 rounded-lg mb-6">
            <Image
              src={(typeof car.images[0] === 'string' ? car.images[0] : car.images[0]?.url) || '/images/car-placeholder.jpg'}
              alt={`${car.make} ${car.model}`}
              width={80}
              height={60}
              className="rounded object-cover"
            />
            <div>
              <div className="font-semibold text-gray-900">
                {car.year} {car.make} {car.model}
              </div>
              <div className="text-sm text-gray-600">Stock: #{car.stockNo}</div>
              <div className="text-[var(--accent)] font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: car.currency,
                  minimumFractionDigits: 0,
                }).format(car.price)}
              </div>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <FaCheck className="mx-auto text-5xl text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your interest. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">Select Country</option>
                  {(settings?.countries || ['Zambia', 'Zimbabwe', 'Malawi', 'DRC', 'Tanzania', 'Kenya']).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-semibold 
                         hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <FaSpinner className="animate-spin" />}
                {loading ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN STOCK DETAIL PAGE
// =====================================================
export default function StockDetailPage({
  tenantSlug,
  car,
  similarCars = [],
}: StockDetailPageProps) {
  const { settings, currency } = useTenantTheme();
  const router = useRouter();
  const [showInquiry, setShowInquiry] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Add to recently viewed on mount
  useEffect(() => {
    addToRecentlyViewed(tenantSlug, car.stockNo);
  }, [tenantSlug, car.stockNo]);

  const carTitle = `${car.year} ${car.make} ${car.model}${car.variant ? ` ${car.variant}` : ''}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: car.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const specs: CarSpec[] = [
    { label: 'Year', value: car.year.toString(), icon: <FaCalendarAlt /> },
    { label: 'Mileage', value: `${car.mileage.toLocaleString()} km`, icon: <FaTachometerAlt /> },
    { label: 'Transmission', value: car.transmission, icon: <FaCogs /> },
    { label: 'Fuel', value: car.fuel, icon: <FaGasPump /> },
    car.engineSize && { label: 'Engine', value: `${car.engineSize}L`, icon: <FaCar /> },
    car.bodyType && { label: 'Body Type', value: car.bodyType, icon: <FaCar /> },
    car.color && { label: 'Color', value: car.color, icon: <FaPalette /> },
    car.driveType && { label: 'Drive', value: car.driveType, icon: <FaRoad /> },
    car.steering && { label: 'Steering', value: car.steering, icon: <FaCar /> },
    car.doors && { label: 'Doors', value: car.doors.toString(), icon: <FaCar /> },
    car.seats && { label: 'Seats', value: car.seats.toString(), icon: <FaCar /> },
  ].filter(Boolean) as CarSpec[];

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this ${carTitle} - ${formatPrice(car.price)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: carTitle, text, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/t/${tenantSlug}`} className="hover:text-[var(--accent)]">Home</Link>
            <FaChevronRight className="text-xs" />
            <Link href={`/t/${tenantSlug}/stock`} className="hover:text-[var(--accent)]">Stock</Link>
            <FaChevronRight className="text-xs" />
            <Link href={`/t/${tenantSlug}/stock?make=${car.make}`} className="hover:text-[var(--accent)]">
              {car.make}
            </Link>
            <FaChevronRight className="text-xs" />
            <span className="text-gray-900 font-medium">{car.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <ImageGallery images={car.images} carTitle={carTitle} />
            </div>

            {/* Quick Specs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-[var(--accent)]">{spec.icon}</div>
                    <div>
                      <div className="text-xs text-gray-500">{spec.label}</div>
                      <div className="font-semibold text-gray-900">{spec.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Equipment</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <FaCheck className="text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{car.description}</p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <FaShieldAlt />, title: 'Quality Guaranteed', desc: '150-point inspection' },
                  { icon: <FaTruck />, title: 'Fast Shipping', desc: 'To your nearest port' },
                  { icon: <FaFileAlt />, title: 'Full Documentation', desc: 'Export papers included' },
                  { icon: <FaPhone />, title: '24/7 Support', desc: 'We\'re here to help' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-3">
                    <div className="text-2xl text-[var(--accent)] mb-2">{item.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-4">
            {/* Price Card - Sticky */}
            <div className="bg-white rounded-xl shadow-sm sticky top-4">
              <div className="p-6">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{carTitle}</h1>
                <div className="text-gray-500 mb-4">Stock No: #{car.stockNo}</div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.isNew && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">NEW</span>}
                  {car.isHot && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">HOT</span>}
                  {car.isPriceDrop && <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">PRICE DROP</span>}
                </div>

                {/* Price */}
                <div className="mb-6">
                  {car.originalPrice && car.originalPrice > car.price && (
                    <div className="text-lg text-gray-400 line-through">
                      {formatPrice(car.originalPrice)}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-[var(--accent)]">
                    {formatPrice(car.price)}
                  </div>
                  {car.discountPercent && (
                    <span className="text-sm text-green-600 font-semibold">
                      Save {car.discountPercent}%
                    </span>
                  )}
                </div>

                {/* CIF Price Info */}
                {car.cifPrice && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">FOB Price</span>
                      <span className="font-medium">{formatPrice(car.fobPrice || car.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Est. Shipping</span>
                      <span className="font-medium">
                        {formatPrice(car.shippingEstimate || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-1">
                      <span>Total CIF</span>
                      <span className="text-[var(--accent)]">{formatPrice(car.cifPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Main CTA */}
                <button
                  onClick={() => setShowInquiry(true)}
                  className="w-full bg-[var(--accent)] text-white py-4 rounded-lg font-bold text-lg 
                           hover:opacity-90 transition-opacity mb-3"
                >
                  Inquire Now
                </button>

                {/* WhatsApp */}
                {(settings?.support as { whatsapp?: string })?.whatsapp && (
                  <a
                    href={`https://wa.me/${((settings?.support as { whatsapp?: string })?.whatsapp || '').replace(/\D/g, '')}?text=Hi, I'm interested in ${carTitle} (Stock: ${car.stockNo})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold 
                             hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="text-xl" />
                    WhatsApp Us
                  </a>
                )}

                {/* Secondary Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      isFavorited 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isFavorited ? <FaHeart /> : <FaRegHeart />}
                    <span className="text-sm">Save</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 
                             hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaShare />
                    <span className="text-sm">Share</span>
                  </button>
                  <Link
                    href={`/t/${tenantSlug}/stock/${car.stockNo}/print`}
                    target="_blank"
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 
                             hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPrint />
                    <span className="text-sm">Print</span>
                  </Link>
                </div>
              </div>

              {/* Support Contact */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
                <div className="text-sm text-gray-600 mb-2">Need help? Contact us:</div>
                <div className="flex flex-col gap-1">
                  {settings?.support?.phone && (
                    <a href={`tel:${settings.support.phone}`} className="text-sm text-[var(--accent)] font-medium">
                      <FaPhone className="inline mr-2" />
                      {settings.support.phone}
                    </a>
                  )}
                  {settings?.support?.email && (
                    <a href={`mailto:${settings.support.email}`} className="text-sm text-[var(--accent)] font-medium">
                      <FaEnvelope className="inline mr-2" />
                      {settings.support.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* CIF Calculator Link */}
            <Link
              href={`/t/${tenantSlug}/cif-calculator?stockNo=${car.stockNo}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <FaCalculator className="text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Calculate Total Cost</div>
                  <div className="text-sm text-gray-600">Get CIF price to your location</div>
                </div>
                <FaChevronRight className="ml-auto text-gray-400" />
              </div>
            </Link>
          </div>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Similar Vehicles</h2>
              <Link
                href={`/t/${tenantSlug}/stock?make=${car.make}`}
                className="text-[var(--accent)] hover:underline font-medium"
              >
                View All {car.make}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarCars.slice(0, 4).map((similarCar) => (
                <Link
                  key={similarCar.id}
                  href={`/t/${tenantSlug}/stock/${similarCar.stockNo}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={(typeof similarCar.images[0] === 'string' ? similarCar.images[0] : similarCar.images[0]?.url) || '/images/car-placeholder.jpg'}
                      alt={`${similarCar.make} ${similarCar.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-gray-900 truncate">
                      {similarCar.year} {similarCar.make} {similarCar.model}
                    </div>
                    <div className="text-[var(--accent)] font-bold">
                      {formatPrice(similarCar.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-30">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-xl font-bold text-[var(--accent)]">{formatPrice(car.price)}</div>
          </div>
          <button
            onClick={() => setShowInquiry(true)}
            className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-semibold"
          >
            Inquire
          </button>
          {(settings?.support as { whatsapp?: string })?.whatsapp && (
            <a
              href={`https://wa.me/${((settings?.support as { whatsapp?: string })?.whatsapp || '').replace(/\D/g, '')}?text=Hi, I'm interested in ${carTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 rounded-lg"
            >
              <FaWhatsapp className="text-xl" />
            </a>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal car={car} tenantSlug={tenantSlug} onClose={() => setShowInquiry(false)} />
      )}
    </div>
  );
}
