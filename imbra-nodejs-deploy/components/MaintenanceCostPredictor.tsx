'use client';
'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface MaintenancePredictionProps {
  carMake: string;
  carModel: string;
  carYear: number;
  currentMileage: number;
  className?: string;
}

interface MaintenanceItem {
  id: string;
  name: string;
  frequency: number; // months
  cost: number;
  urgency: 'low' | 'medium' | 'high';
  description: string;
}

export default function MaintenanceCostPredictor({
  carMake,
  carModel,
  carYear,
  currentMileage,
  className = ''
}: MaintenancePredictionProps) {
  const [predictions, setPredictions] = useState<MaintenanceItem[]>([]);
  const [timeframe, setTimeframe] = useState<'1year' | '2years' | '5years'>('1year');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get maintenance predictions
    const fetchMaintenanceData = async () => {
      setIsLoading(true);

      setTimeout(() => {
        const baseMaintenance: MaintenanceItem[] = [
          {
            id: 'oil-change',
            name: 'Oil Change',
            frequency: 6,
            cost: 80,
            urgency: 'medium',
            description: 'Regular oil and filter replacement'
          },
          {
            id: 'tire-rotation',
            name: 'Tire Rotation',
            frequency: 6,
            cost: 25,
            urgency: 'low',
            description: 'Rotate tires for even wear'
          },
          {
            id: 'brake-inspection',
            name: 'Brake Inspection',
            frequency: 12,
            cost: 50,
            urgency: 'medium',
            description: 'Check brake pads and rotors'
          },
          {
            id: 'transmission-service',
            name: 'Transmission Service',
            frequency: 24,
            cost: 150,
            urgency: 'medium',
            description: 'Transmission fluid change'
          },
          {
            id: 'timing-belt',
            name: 'Timing Belt Replacement',
            frequency: 60,
            cost: 600,
            urgency: 'high',
            description: 'Replace timing belt and water pump'
          },
          {
            id: 'spark-plugs',
            name: 'Spark Plugs',
            frequency: 48,
            cost: 120,
            urgency: 'medium',
            description: 'Replace spark plugs'
          },
          {
            id: 'air-filter',
            name: 'Air Filter Replacement',
            frequency: 24,
            cost: 35,
            urgency: 'low',
            description: 'Replace engine air filter'
          },
          {
            id: 'coolant-flush',
            name: 'Coolant Flush',
            frequency: 36,
            cost: 100,
            urgency: 'medium',
            description: 'Flush and replace coolant'
          }
        ];

        // Adjust costs based on car age
        const ageMultiplier = Math.max(0.8, 1 - ((2025 - carYear) * 0.05));
        const adjustedMaintenance = baseMaintenance.map(item => ({
          ...item,
          cost: Math.round(item.cost * ageMultiplier)
        }));

        setPredictions(adjustedMaintenance);
        setIsLoading(false);
      }, 1200);
    };

    fetchMaintenanceData();
  }, [carMake, carModel, carYear]);

  const getTimeframeMonths = () => {
    switch (timeframe) {
      case '1year': return 12;
      case '2years': return 24;
      case '5years': return 60;
      default: return 12;
    }
  };

  const calculateTotalCost = () => {
    const months = getTimeframeMonths();
    return predictions.reduce((total, item) => {
      const occurrences = Math.floor(months / item.frequency);
      return total + (occurrences * item.cost);
    }, 0);
  };

  const getUpcomingMaintenance = () => {
    const months = getTimeframeMonths();
    return predictions
      .map(item => ({
        ...item,
        nextDue: item.frequency,
        occurrences: Math.floor(months / item.frequency)
      }))
      .filter(item => item.occurrences > 0)
      .sort((a, b) => a.nextDue - b.nextDue)
      .slice(0, 5);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Maintenance Predictor</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalCost = calculateTotalCost();
  const upcomingMaintenance = getUpcomingMaintenance();

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Maintenance Predictor</h3>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Timeframe</label>
        <div className="flex gap-2">
          {[
            { value: '1year', label: '1 Year' },
            { value: '2years', label: '2 Years' },
            { value: '5years', label: '5 Years' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Estimated Maintenance Cost</div>
            <div className="text-2xl font-bold text-blue-600">${totalCost.toLocaleString()}</div>
            <div className="text-sm text-gray-600">over {timeframe.replace('years', ' years').replace('year', ' year')}</div>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Monthly Cost */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            ${(totalCost / getTimeframeMonths()).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">per month</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            ${(totalCost / (getTimeframeMonths() / 12)).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">per year</div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Upcoming Maintenance</h4>
        <div className="space-y-3">
          {upcomingMaintenance.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">${item.cost}</div>
                <div className="text-sm text-gray-600">Every {item.frequency}mo</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning for High-Urgency Items */}
      {predictions.some(item => item.urgency === 'high' && item.frequency <= getTimeframeMonths()) && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <div className="font-medium text-red-800">High Priority Maintenance Due</div>
            <div className="text-sm text-red-700">
              Some critical maintenance items are due soon. Schedule service to avoid costly repairs.
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>* Estimates based on average costs for {carMake} {carModel}. Actual costs may vary by location and service provider.</p>
      </div>
    </div>
  );
}