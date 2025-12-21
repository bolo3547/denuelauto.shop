import React, { useState } from 'react';
import { FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const videoTestimonials = [
  {
    id: '1',
    name: 'John D.',
    country: 'Zambia',
    videoUrl: '/api/placeholder/video1.mp4', // Placeholder
    thumbnail: '/api/placeholder/300/200?john',
    text: 'Excellent service! My car arrived in perfect condition.'
  },
  {
    id: '2',
    name: 'Maria S.',
    country: 'Kenya',
    videoUrl: '/api/placeholder/video2.mp4',
    thumbnail: '/api/placeholder/300/200?maria',
    text: 'Very professional team. Fast shipping and great support.'
  },
  {
    id: '3',
    name: 'Ahmed T.',
    country: 'Tanzania',
    videoUrl: '/api/placeholder/video3.mp4',
    thumbnail: '/api/placeholder/300/200?ahmed',
    text: 'Good prices and reliable. Will buy again!'
  }
];

const VideoTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % videoTestimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length);

  const current = videoTestimonials[currentIndex];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Customer Video Testimonials</h2>
        <div className="relative">
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <div className="relative">
              <img src={current.thumbnail} alt={`${current.name} testimonial`} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  title="Play video testimonial"
                  className="bg-white/80 rounded-full p-4 hover:bg-white transition-colors"
                >
                  <FaPlay className="text-blue-600" size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 italic mb-4">"{current.text}"</p>
              <div className="font-semibold text-blue-600">{current.name}, {current.country}</div>
            </div>
          </div>
          <button
            type="button"
            title="Previous testimonial"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:shadow-lg"
          >
          <button
            type="button"
            title="Next testimonial"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:shadow-lg"
          >
            <FaChevronRight />
          </button>
            <FaChevronRight />
          </button>
        </div>
        <div className="flex justify-center mt-4 gap-2">
          {videoTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonials;
