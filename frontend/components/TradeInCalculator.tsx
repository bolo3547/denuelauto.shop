'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Gauge } from 'lucide-react';

interface TradeInCalculatorProps {
  className?: string;
}

export default function TradeInCalculator({ className = '' }: TradeInCalculatorProps) {
  const [carDetails, setCarDetails] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: 'good',
    location: ''
  });

  const [tradeInValue, setTradeInValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateTradeInValue = async () => {
    setIsCalculating(true);

    // Simulate API call to calculate trade-in value
    setTimeout(() => {
      // Mock calculation based on inputs
      const baseValue = 15000; // Base value for a typical car
      const yearMultiplier = (2025 - parseInt(carDetails.year || '2020')) * 0.1;
      const mileageMultiplier = (parseInt(carDetails.mileage || '50000') / 10000) * -0.05;
      const conditionMultiplier = carDetails.condition === 'excellent' ? 0.1 :
                                 carDetails.condition === 'good' ? 0 :
                                 carDetails.condition === 'fair' ? -0.1 : -0.2;

      const calculatedValue = baseValue * (1 + yearMultiplier + mileageMultiplier + conditionMultiplier);
      setTradeInValue(Math.max(calculatedValue, 1000)); // Minimum value
      setIsCalculating(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setCarDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Trade-In Value Calculator</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              type="text"
              value={carDetails.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              placeholder="e.g., Toyota"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={carDetails.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="e.g., Camry"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={carDetails.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              placeholder="e.g., 2020"
              min="1990"
              max="2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
            <input
              type="number"
              value={carDetails.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select
            value={carDetails.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            title="Condition"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={carDetails.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Lusaka, Zambia"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={calculateTradeInValue}
        disabled={isCalculating || !carDetails.make || !carDetails.model || !carDetails.year}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isCalculating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Calculating...
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            Calculate Trade-In Value
          </>
        )}
      </button>

      {tradeInValue !== null && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Estimated Trade-In Value</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${tradeInValue.toLocaleString()}
          </div>
          <p className="text-sm text-green-700">
            This is an estimate based on current market conditions. Actual value may vary.
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>* Estimates are for informational purposes only. Contact us for a professional appraisal.</p>
      </div>
    </div>
  );
}