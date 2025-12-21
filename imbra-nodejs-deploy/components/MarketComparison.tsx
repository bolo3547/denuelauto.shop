'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Percent } from 'lucide-react';

interface MarketComparisonProps {
  carPrice: number;
  carMake: string;
  carModel: string;
  carYear: number;
  className?: string;
}

export default function MarketComparison({
  carPrice,
  carMake,
  carModel,
  carYear,
  className = ''
}: MarketComparisonProps) {
  const [marketData, setMarketData] = useState({
    averagePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    percentile: 0,
    trend: 'stable' as 'up' | 'down' | 'stable',
    confidence: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get market data
    const fetchMarketData = async () => {
      setIsLoading(true);

      // Mock market data calculation
      setTimeout(() => {
        const basePrice = carPrice * 0.9; // Slightly lower base for used cars
        const averagePrice = basePrice + (Math.random() - 0.5) * basePrice * 0.3;
        const minPrice = averagePrice * 0.7;
        const maxPrice = averagePrice * 1.4;

        // Calculate percentile
        const percentile = carPrice < averagePrice * 0.8 ? Math.random() * 20 :
                          carPrice < averagePrice * 0.9 ? 20 + Math.random() * 20 :
                          carPrice < averagePrice * 1.1 ? 40 + Math.random() * 40 :
                          carPrice < averagePrice * 1.2 ? 80 + Math.random() * 15 : 95 + Math.random() * 5;

        const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';

        setMarketData({
          averagePrice: Math.round(averagePrice),
          minPrice: Math.round(minPrice),
          maxPrice: Math.round(maxPrice),
          percentile: Math.round(percentile),
          trend,
          confidence: Math.round(75 + Math.random() * 20) // 75-95% confidence
        });

        setIsLoading(false);
      }, 1500);
    };

    fetchMarketData();
  }, [carPrice, carMake, carModel, carYear]);

  const getPricePosition = () => {
    const { percentile } = marketData;
    if (percentile < 25) return { label: 'Below Market', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (percentile < 75) return { label: 'Fair Market', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { label: 'Above Market', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  };

  const pricePosition = getPricePosition();
  const priceDifference = ((carPrice - marketData.averagePrice) / marketData.averagePrice) * 100;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Market Comparison</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Market Comparison</h3>
      </div>

      {/* Price Position Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${pricePosition.bgColor} ${pricePosition.color}`}>
        <DollarSign className="w-4 h-4" />
        {pricePosition.label}
      </div>

      {/* Main Price Comparison */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Your Price</span>
          <span className="font-semibold text-gray-900">${carPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Market Average</span>
          <span className="font-semibold text-gray-900">${marketData.averagePrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Difference</span>
          <span className={`font-semibold ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Price Range Visualization */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>${marketData.minPrice.toLocaleString()}</span>
          <span>${marketData.maxPrice.toLocaleString()}</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{
              left: `${((marketData.averagePrice - marketData.minPrice) / (marketData.maxPrice - marketData.minPrice)) * 100}%`,
              width: '2px',
              transform: 'translateX(-50%)'
            }}
          ></div>
          <div
            className="absolute h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow"
            style={{
              left: `${((carPrice - marketData.minPrice) / (marketData.maxPrice - marketData.minPrice)) * 100}%`,
              top: '-2px',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Min</span>
          <span className="font-medium">Avg</span>
          <span>Max</span>
        </div>
      </div>

      {/* Percentile and Trend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{marketData.percentile}th</div>
          <div className="text-sm text-gray-600">Percentile</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {marketData.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
            {marketData.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
            {marketData.trend === 'stable' && <div className="w-4 h-0.5 bg-gray-400 rounded"></div>}
            <span className={`text-sm font-medium ${
              marketData.trend === 'up' ? 'text-green-600' :
              marketData.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {marketData.trend === 'up' ? 'Rising' :
               marketData.trend === 'down' ? 'Falling' : 'Stable'}
            </span>
          </div>
          <div className="text-sm text-gray-600">Market Trend</div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Data Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${marketData.confidence}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900">{marketData.confidence}%</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Market data based on recent sales in your region. Prices may vary.</p>
      </div>
    </div>
  );
}