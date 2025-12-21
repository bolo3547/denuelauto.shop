import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const dealerReviews = [
  {
    id: '1',
    name: 'Sarah M.',
    country: 'Kenya',
    rating: 5,
    review: 'Outstanding service! The team was very professional and kept me updated throughout the entire process.',
    date: '2025-11-15'
  },
  {
    id: '2',
    name: 'David K.',
    country: 'Zambia',
    rating: 5,
    review: 'Great experience buying from them. Car arrived exactly as described and shipping was smooth.',
    date: '2025-10-28'
  },
  {
    id: '3',
    name: 'Grace A.',
    country: 'Tanzania',
    rating: 4,
    review: 'Very reliable dealership. Good communication and fair pricing. Highly recommended.',
    date: '2025-09-12'
  }
];

const DealerRatingsReviews: React.FC = () => {
  const averageRating = dealerReviews.reduce((sum, review) => sum + review.rating, 0) / dealerReviews.length;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Dealer Ratings & Reviews</h2>

        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'} size={32} />
              ))}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <div className="text-gray-600">Based on {dealerReviews.length} reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dealerReviews.map(review => (
            <div key={review.id} className="bg-white border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <FaQuoteLeft className="text-gray-400" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"{review.review}"</p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{review.name}</div>
                <div className="text-sm text-gray-500">{review.country} • {new Date(review.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            Write a Review
          </button>
        </div>
      </div>
    </section>
  );
};

export default DealerRatingsReviews;
