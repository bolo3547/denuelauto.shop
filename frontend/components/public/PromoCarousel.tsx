import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const promos: string[] = [
];

const PromoCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-t py-2 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button onClick={() => scroll('left')} className="p-2 bg-blue-100 rounded-full shadow hover:bg-blue-200" aria-label="Scroll left">
          <FaChevronLeft />
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button onClick={() => scroll('right')} className="p-2 bg-blue-100 rounded-full shadow hover:bg-blue-200" aria-label="Scroll right">
          <FaChevronRight />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto text-sm scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
        style={{ scrollbarColor: '#93c5fd #f0f9ff', WebkitOverflowScrolling: 'touch' }}
      >
        {promos.map((p, i) => (
          <div key={i} className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded min-w-max font-medium shadow-sm">
            {p}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;
