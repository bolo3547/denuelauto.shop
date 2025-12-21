"use client";
import React, { useEffect, useRef, useState } from 'react';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  interval?: number; // ms
  pauseOnHover?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function Carousel<T>({
  items,
  renderItem,
  interval = 3500,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
  ariaLabel = 'Carousel',
  className = ''
}: CarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const item = container.children[idx] as HTMLElement | undefined;
    if (!item) return;
    const left = item.offsetLeft - container.offsetLeft;
    container.scrollTo({ left, behavior: 'smooth' });
    activeRef.current = idx;
    setActiveIndex(idx);
  };

  const start = () => {
    const container = containerRef.current;
    if (!container || items.length <= 1) return;
    stop();
    timerRef.current = window.setInterval(() => {
      const next = (activeRef.current + 1) % items.length;
      scrollToIndex(next);
    }, interval);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, interval]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        stop();
        const prev = (activeRef.current - 1 + items.length) % items.length;
        scrollToIndex(prev);
        start();
      } else if (e.key === 'ArrowRight') {
        stop();
        const next = (activeRef.current + 1) % items.length;
        scrollToIndex(next);
        start();
      }
    };
    container.addEventListener('keydown', onKey as any);
    return () => container.removeEventListener('keydown', onKey as any);
  }, [items.length, interval]);

  return (
    <div className={`relative ${className}`} role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
      {/* Arrows are rendered below for left and right sides. */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="flex gap-3 overflow-x-auto py-2 scroll-smooth"
        onMouseEnter={() => pauseOnHover && stop()}
        onMouseLeave={() => pauseOnHover && start()}
        onTouchStart={() => pauseOnHover && stop()}
        onTouchEnd={() => pauseOnHover && start()}
      >
        {items.map((item, idx) => (
          <div key={idx} className={`min-w-[220px] ${idx === activeIndex ? 'ring-2 ring-green-200' : ''}`}>
            {renderItem(item, idx, idx === activeIndex)}
          </div>
        ))}
      </div>
      {showArrows && items.length > 1 && (
        <div className="absolute inset-y-0 left-0 flex h-full items-center z-20">
          <button aria-label="Previous" onClick={() => { stop(); const prev = (activeRef.current - 1 + items.length) % items.length; scrollToIndex(prev); start(); }} className="ml-2 p-2 bg-white rounded-full shadow">◀</button>
        </div>
      )}
      {showArrows && items.length > 1 && (
        <div className="absolute inset-y-0 right-0 flex h-full items-center z-20">
          <button aria-label="Next" onClick={() => { stop(); const next = (activeRef.current + 1) % items.length; scrollToIndex(next); start(); }} className="mr-2 p-2 bg-white rounded-full shadow">▶</button>
        </div>
      )}
      {showDots && items.length > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="group" aria-label="Carousel pagination">
          {items.map((_, i) => (
              <button
                aria-label={activeIndex === i ? `Go to slide ${i + 1} (current)` : `Go to slide ${i + 1}`}
                role="button"
              key={i}
              className={`w-2 h-2 rounded-full ${activeIndex === i ? 'bg-[#0F3D91]' : 'bg-gray-300'}`}
              onClick={() => { stop(); scrollToIndex(i); start(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
