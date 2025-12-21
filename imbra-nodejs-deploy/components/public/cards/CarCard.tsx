'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaHeart, 
  FaRegHeart, 
  FaExchangeAlt, 
  FaTachometerAlt, 
  FaGasPump, 
  FaCogs,
  FaPlus,
  FaCalendarAlt
} from 'react-icons/fa';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel: string;
  engineSize?: string;
  color?: string;
  images: string[];
  location?: string;
  isNew?: boolean;
  isHot?: boolean;
  isPriceDrop?: boolean;
  discountPercent?: number;
}

interface CarCardProps {
  car: Car;
  tenantSlug: string;
  compact?: boolean;
  onAddToCompare?: (car: Car) => void;
  onToggleFavorite?: (carId: string) => void;
  isFavorited?: boolean;
  isInCompare?: boolean;
}

export default function CarCard({
  car,
  tenantSlug,
  compact = false,
  onAddToCompare,
  onToggleFavorite,
  isFavorited = false,
  isInCompare = false,
}: CarCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(0)}k km`;
    }
    return `${km} km`;
  };

  const mainImage = car.images?.[0] || '/images/car-placeholder.jpg';
  const secondImage = car.images?.[1] || mainImage;

  if (compact) {
    return (
      <Link
        href={`/t/${tenantSlug}/stock/${car.stockNo}`}
        className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--border)] 
                 hover:shadow-md hover:border-[var(--accent)]/30 transition-all"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={imageError ? '/images/car-placeholder.jpg' : mainImage}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {car.discountPercent && car.discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{car.discountPercent}%
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-[var(--text)] truncate group-hover:text-[var(--accent)]">
            {car.year} {car.make} {car.model}
          </h3>
          <div className="text-[var(--accent)] font-bold mt-1">
            {formatPrice(car.price, car.currency)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--border)] 
               hover:shadow-lg hover:border-[var(--accent)]/30 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image section */}
      <div className="relative aspect-[4/3]">
        <Link href={`/t/${tenantSlug}/stock/${car.stockNo}`}>
          <Image
            src={imageError ? '/images/car-placeholder.jpg' : (isHovered && secondImage ? secondImage : mainImage)}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            className="object-cover transition-all duration-300"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {car.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </span>
          )}
          {car.isHot && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              HOT
            </span>
          )}
          {car.isPriceDrop && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              PRICE DROP
            </span>
          )}
          {car.discountPercent && car.discountPercent > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{car.discountPercent}%
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(car.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCompare?.(car);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              isInCompare ? 'bg-[var(--accent)] text-white' : 'bg-white text-gray-600 hover:text-[var(--accent)]'
            }`}
            title={isInCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <FaExchangeAlt />
          </button>
        </div>

        {/* Stock number */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          #{car.stockNo}
        </div>

        {/* Image count */}
        {car.images && car.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <FaPlus className="text-[10px]" />
            {car.images.length} photos
          </div>
        )}
      </div>

      {/* Content section */}
      <Link href={`/t/${tenantSlug}/stock/${car.stockNo}`} className="block p-4">
        <h3 className="font-bold text-lg text-[var(--text)] mb-1 group-hover:text-[var(--accent)] transition-colors">
          {car.year} {car.make} {car.model}
        </h3>

        {/* Specs row */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <FaTachometerAlt className="text-[var(--accent)]" />
            {formatMileage(car.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <FaCogs className="text-[var(--accent)]" />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1">
            <FaGasPump className="text-[var(--accent)]" />
            {car.fuel}
          </span>
          {car.engineSize && (
            <span className="flex items-center gap-1">
              {car.engineSize}L
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {car.originalPrice && car.originalPrice > car.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(car.originalPrice, car.currency)}
              </div>
            )}
            <div className="text-xl font-bold text-[var(--accent)]">
              {formatPrice(car.price, car.currency)}
            </div>
          </div>
          {car.location && (
            <div className="text-xs text-gray-500">
              {car.location}
            </div>
          )}
        </div>
      </Link>

      {/* Quick action bar */}
      <div className="border-t border-[var(--border)] px-4 py-2 flex gap-2">
        <Link
          href={`/t/${tenantSlug}/stock/${car.stockNo}?inquiry=true`}
          className="flex-1 bg-[var(--accent)] text-white text-center py-2 rounded-lg text-sm 
                   font-semibold hover:opacity-90 transition-opacity"
        >
          Inquire Now
        </Link>
        <Link
          href={`/t/${tenantSlug}/stock/${car.stockNo}`}
          className="flex-1 bg-gray-100 text-[var(--text)] text-center py-2 rounded-lg text-sm 
                   font-semibold hover:bg-gray-200 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
