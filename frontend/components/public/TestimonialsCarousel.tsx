import React, { useState } from 'react';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { testimonials } from './testimonialsData';

const TestimonialsCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;

  const prev = () => setIndex(i => (i === 0 ? total - 1 : i - 1));
  const next = () => setIndex(i => (i === total - 1 ? 0 : i + 1));
  const t = testimonials[index];

  return (
    <div className="bg-white/90 rounded-xl shadow-lg p-8 max-w-2xl mx-auto flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-blue-600" />
        <div>
          <div className="font-semibold text-blue-700 text-lg">{t.name}</div>
          <div className="text-xs text-gray-500">{t.country} • {new Date(t.date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < t.rating ? 'text-yellow-400' : 'text-gray-300'} />
        ))}
      </div>
      <div className="italic text-gray-700 mb-2 text-center">“{t.text}”</div>
      <div className="flex gap-4 mt-4">
        <button onClick={prev} aria-label="Previous testimonial" className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"><FaChevronLeft /></button>
        <button onClick={next} aria-label="Next testimonial" className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"><FaChevronRight /></button>
      </div>
      <div className="mt-2 text-xs text-gray-400">{index + 1} / {total}</div>
    </div>
  );
};

export default TestimonialsCarousel;
