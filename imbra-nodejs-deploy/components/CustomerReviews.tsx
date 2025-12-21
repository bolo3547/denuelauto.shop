'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  carModel?: string;
}

interface CustomerReviewsProps {
  carId?: string;
  className?: string;
}

export default function CustomerReviews({ carId, className = '' }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'John Mwale',
      customerAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5,
      title: 'Excellent service and quality cars',
      comment: 'Denuel Auto provided outstanding service. The car I purchased was exactly as described and the financing process was smooth. Highly recommend!',
      date: '2025-11-15',
      verified: true,
      helpful: 12,
      carModel: 'Toyota Camry 2023'
    },
    {
      id: '2',
      customerName: 'Chipo Banda',
      customerAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5,
      title: 'Great export experience',
      comment: 'I exported a car to Malawi and the entire process was handled professionally. Documentation was perfect and delivery was on time.',
      date: '2025-11-10',
      verified: true,
      helpful: 8,
      carModel: 'Honda CR-V 2022'
    },
    {
      id: '3',
      customerName: 'Peter Kamau',
      customerAvatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      rating: 4,
      title: 'Good value for money',
      comment: 'Found a reliable used car at a competitive price. The inspection report was detailed and helped me make an informed decision.',
      date: '2025-11-05',
      verified: true,
      helpful: 6,
      carModel: 'Nissan Altima 2021'
    },
    {
      id: '4',
      customerName: 'Grace Ndlovu',
      customerAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      rating: 5,
      title: 'Amazing customer support',
      comment: 'The team went above and beyond to help me find the right car for my needs. Their knowledge and patience made the whole experience enjoyable.',
      date: '2025-10-28',
      verified: true,
      helpful: 15,
      carModel: 'Mazda CX-5 2023'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const reviewsPerPage = 3;

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating =>
    reviews.filter(review => review.rating === rating).length
  );

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
            } ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
      </div>

      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-1">
              {renderStars(Math.round(averageRating), 'md')}
            </div>
            <div className="text-sm text-gray-600">{reviews.length} reviews</div>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(ratingDistribution[5 - rating] / reviews.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-6">{ratingDistribution[5 - rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Sort by"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + reviewsPerPage, reviews.length)} of {reviews.length}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mb-6">
        {paginatedReviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={review.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customerName)}&background=0F3D91&color=FFD700`}
                alt={review.customerName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{review.customerName}</span>
                  {review.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{review.date}</span>
                </div>
                {review.carModel && (
                  <div className="text-sm text-gray-600 mb-2">Purchased: {review.carModel}</div>
                )}
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            <p className="text-gray-700 mb-3">{review.comment}</p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}