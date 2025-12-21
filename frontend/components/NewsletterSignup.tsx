'use client';

import React, { useState } from 'react';
import { Mail, Check, X } from 'lucide-react';

interface NewsletterSignupProps {
  className?: string;
}

export default function NewsletterSignup({ className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  if (isSubscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-green-800">
          <Check className="w-5 h-5" />
          <span className="font-medium">Successfully subscribed!</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Thank you for subscribing. You'll receive our latest deals and updates.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6" />
        <h3 className="text-xl font-bold">Stay Updated</h3>
      </div>

      <p className="mb-4 text-blue-100">
        Get the latest car deals, financing offers, and exclusive promotions delivered to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-white text-blue-600 px-6 py-2 rounded font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-300 text-sm">
            <X className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <p className="text-xs text-blue-200 mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}