'use client';

import React, { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { DealerCar } from '../types/dealerCar';

interface VirtualTourProps {
  car: DealerCar;
  onClose: () => void;
}

export default function VirtualTour({ car, onClose }: VirtualTourProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const images = car.images || ['/placeholder-car.jpg'];
  const hasVideo = false; // TODO: Add videoUrl to DealerCar type when needed

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative max-w-4xl w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          aria-label="Close virtual tour"
          title="Close virtual tour"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main Image Display */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`${car.make} ${car.model} - Image ${currentImageIndex + 1}`}
            className="w-full h-[60vh] object-contain"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                title="Previous image"
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
                title="Next image"

          {/* Video Play Button */}
          {hasVideo && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
              aria-label="Play video"
            >
              <div className="bg-white bg-opacity-90 rounded-full p-4">
                <Play className="w-8 h-8 text-black ml-1" />
              </div>
            </button>
          )}

          {/* Video Player */}
          {showVideo && hasVideo && (
            <div className="absolute inset-0 bg-black">
              <video
                src="/placeholder-video.mp4" // TODO: Replace with car.videoUrl when available
                controls
                autoPlay
                className="w-full h-full object-contain"
                onEnded={() => setShowVideo(false)}
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
              >
                Back to Photos
              </button>
            </div>
          )}
        </div>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                  index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                }`}
                aria-label={`Open image ${index + 1}`}
                title={`Open image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Car Details Overlay */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-xs">
          <h3 className="font-bold text-lg">{car.year} {car.make} {car.model}</h3>
          <div className="text-sm space-y-1 mt-2">
            <div>Price: ${car.price_usd?.toLocaleString()}</div>
            <div>Mileage: {car.mileage_km.toLocaleString()} km</div>
            <div>Engine: {car.engine_cc}cc</div>
            <div>Transmission: {car.transmission}</div>
            <div>Fuel: {car.fuel}</div>
            {car.color && <div>Color: {car.color}</div>}
          </div>
        </div>

        {/* Features */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="text-sm">{images.length} Photos</span>
            {hasVideo && <span className="text-sm ml-2">• Video Available</span>}
          </div>
        </div>
      </div>
    </div>
  );
}