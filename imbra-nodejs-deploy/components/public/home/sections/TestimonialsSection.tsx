'use client';

import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa';
import { useTenantTheme } from '../../tenant/TenantThemeProvider';

interface Testimonial {
  id: string;
  name: string;
  country: string;
  countryFlag?: string;
  rating: number;
  text: string;
  carPurchased?: string;
  date: string;
  avatar?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Mwanza',
    country: 'Zambia',
    countryFlag: '🇿🇲',
    rating: 5,
    text: 'Excellent service! The car arrived exactly as described. The shipping was fast and the documentation was perfect. Will definitely buy again.',
    carPurchased: '2019 Toyota RAV4',
    date: '2024-01-15',
  },
  {
    id: '2',
    name: 'Emmanuel Osei',
    country: 'Ghana',
    countryFlag: '🇬🇭',
    rating: 5,
    text: 'Very professional team. They helped me every step of the way from selecting the car to clearing customs. Highly recommended!',
    carPurchased: '2020 Honda CR-V',
    date: '2024-01-10',
  },
  {
    id: '3',
    name: 'Grace Nakamura',
    country: 'Kenya',
    countryFlag: '🇰🇪',
    rating: 5,
    text: 'The best car buying experience I\'ve ever had. The prices are unbeatable and the quality is top-notch. Thank you!',
    carPurchased: '2018 Nissan X-Trail',
    date: '2024-01-05',
  },
  {
    id: '4',
    name: 'Michael Banda',
    country: 'Zimbabwe',
    countryFlag: '🇿🇼',
    rating: 4,
    text: 'Great selection of vehicles and transparent pricing. The team was very helpful in explaining the import process.',
    carPurchased: '2017 Toyota Hilux',
    date: '2023-12-28',
  },
  {
    id: '5',
    name: 'Fatima Hassan',
    country: 'Tanzania',
    countryFlag: '🇹🇿',
    rating: 5,
    text: 'I was skeptical about buying a car online, but they made it so easy and trustworthy. The car is in perfect condition!',
    carPurchased: '2019 Mazda CX-5',
    date: '2023-12-20',
  },
];

export default function TestimonialsSection() {
  const { settings } = useTenantTheme();
  const testimonials = defaultTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-slide
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  const goToPrev = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have trusted us with their vehicle purchases.
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 
                     bg-white rounded-full shadow-lg flex items-center justify-center 
                     text-gray-600 hover:text-[var(--accent)] transition-colors z-10"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 
                     bg-white rounded-full shadow-lg flex items-center justify-center 
                     text-gray-600 hover:text-[var(--accent)] transition-colors z-10"
          >
            <FaChevronRight />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAutoPlay(false);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-[var(--accent)]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-xl mb-1">
              {renderStars(5)}
            </div>
            <div className="text-2xl font-bold text-[var(--text)]">4.9/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="h-12 w-px bg-gray-300 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">10,000+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div className="h-12 w-px bg-gray-300 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">50+</div>
            <div className="text-sm text-gray-600">Countries Served</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--border)] h-full flex flex-col">
      <FaQuoteLeft className="text-2xl text-[var(--accent)]/30 mb-4" />
      
      <p className="text-gray-700 leading-relaxed flex-1 mb-4">
        "{testimonial.text}"
      </p>

      {testimonial.carPurchased && (
        <div className="text-sm text-[var(--accent)] font-medium mb-4">
          Purchased: {testimonial.carPurchased}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          {testimonial.avatar ? (
            <img 
              src={testimonial.avatar} 
              alt={testimonial.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className="text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-[var(--text)]">{testimonial.name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            {testimonial.countryFlag && <span>{testimonial.countryFlag}</span>}
            {testimonial.country}
          </div>
        </div>
        <div className="flex gap-0.5 text-sm">
          {[...Array(testimonial.rating)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400" />
          ))}
        </div>
      </div>
    </div>
  );
}
