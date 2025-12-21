"use client";

import React from 'react';
import { Car } from 'lucide-react';

interface CarLoadingAnimationProps {
  message?: string;
  direction?: 'ltr' | 'rtl'; // ltr = left-to-right, rtl = right-to-left
  duration?: number; // duration in seconds
  ariaLabel?: string;
  disableControl?: boolean; // show a button to disable animations
  onDisable?: () => void; // callback when user disables animations
}

export default function CarLoadingAnimation({
  message = 'Loading...',
  direction = 'rtl',
  duration = 3,
  ariaLabel,
  disableControl = false,
  onDisable,
}: CarLoadingAnimationProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="relative w-full max-w-md mx-auto">
        {/* Road */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Road markings */}
          <div className="absolute inset-0 flex">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-yellow-400 border-dashed"
                style={{ borderWidth: '0 1px 0 0' }}
              />
            ))}
          </div>

          {/* Moving car */}
          <div
            className="absolute top-0 left-0 w-full h-full reduced-motion-hide"
            style={{
              animation: `${direction === 'ltr' ? 'car-move-ltr' : 'car-move-rtl'} ${duration}s linear infinite`,
            }}
            data-testid="car-moving"
          >
            <div className="relative w-8 h-6 -mt-2 ml-4">
              <Car className="w-8 h-6 text-blue-600 drop-shadow-lg" aria-hidden="true" focusable={false} />
              {/* Car wheels */}
              <div className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 rounded-full animate-spin" aria-hidden />
              <div className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rounded-full animate-spin" aria-hidden />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center mt-8">
          <p className="text-lg font-medium text-gray-700">{message}</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" aria-hidden />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" aria-hidden style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" aria-hidden style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes car-move-ltr {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(calc(100vw + 100px)); }
          }
          @keyframes car-move-rtl {
            0% { transform: translateX(calc(100vw + 100px)); }
            100% { transform: translateX(-100px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .reduced-motion-hide { animation: none !important; }
          }
        `,
      }} />

      {/* Optional disable control */}
      {disableControl && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={() => {
              try { localStorage.setItem('disableCarAnimation', 'true'); } catch (e) {}
              if (typeof onDisable === 'function') onDisable();
            }}
            className="px-3 py-1 bg-gray-100 text-sm rounded border hover:bg-gray-200"
            aria-label="Disable animation"
          >
            Disable animation
          </button>
        </div>
      )}
    </div>
  );
}
