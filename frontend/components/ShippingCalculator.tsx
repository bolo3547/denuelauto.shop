import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkerAlt, FaCalculator, FaShip } from 'react-icons/fa';

interface ShippingCalculatorProps {
  className?: string;
}

interface Port {
  id: string;
  name: string;
  country: string;
  region: string;
}

export default function ShippingCalculator({ className = '' }: ShippingCalculatorProps) {
  const [carPrice, setCarPrice] = useState<string>('10000');
  const [destinationPort, setDestinationPort] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<string>('container');
  const [insurance, setInsurance] = useState<boolean>(true);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);

  const ports: Port[] = [
    { id: 'dar-es-salaam', name: 'Dar es Salaam', country: 'Tanzania', region: 'East Africa' },
    { id: 'djibouti', name: 'Djibouti', country: 'Djibouti', region: 'East Africa' },
    { id: 'mogadishu', name: 'Mogadishu', country: 'Somalia', region: 'East Africa' },
    { id: 'maputo', name: 'Maputo', country: 'Mozambique', region: 'Southern Africa' },
    { id: 'durban', name: 'Durban', country: 'South Africa', region: 'Southern Africa' },
    { id: 'luanda', name: 'Luanda', country: 'Angola', region: 'West Africa' },
    { id: 'lagos', name: 'Lagos', country: 'Nigeria', region: 'West Africa' },
    { id: 'accra', name: 'Accra', country: 'Ghana', region: 'West Africa' },
    { id: 'antananarivo', name: 'Antananarivo', country: 'Madagascar', region: 'Indian Ocean' },
    { id: 'colombo', name: 'Colombo', country: 'Sri Lanka', region: 'Asia' },
    { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', region: 'Asia' }
  ];

  const shippingRates = {
    'East Africa': { container: 1800, roRo: 1200 },
    'Southern Africa': { container: 1600, roRo: 1000 },
    'West Africa': { container: 2200, roRo: 1500 },
    'Indian Ocean': { container: 2000, roRo: 1300 },
    'Asia': { container: 2500, roRo: 1800 }
  };

  const calculateShipping = () => {
    if (!destinationPort || !carPrice) return;

    const port = ports.find(p => p.id === destinationPort);
    if (!port) return;

    const baseShipping = shippingRates[port.region as keyof typeof shippingRates][shippingMethod as keyof typeof shippingRates['East Africa']];
    const carValue = parseFloat(carPrice);

    // Additional fees
    const customsClearance = carValue * 0.05; // 5% of car value
    const documentation = 150;
    const inspection = 100;
    const insuranceCost = insurance ? carValue * 0.02 : 0; // 2% insurance

    const total = baseShipping + customsClearance + documentation + inspection + insuranceCost;

    setTotalCost(total);
    setBreakdown({
      baseShipping,
      customsClearance,
      documentation,
      inspection,
      insurance: insuranceCost,
      total
    });
  };

  useEffect(() => {
    calculateShipping();
  }, [carPrice, destinationPort, shippingMethod, insurance]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaTruck className="text-blue-600" />
        <h3 className="text-lg font-semibold">Shipping Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Car Price (USD)
          </label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter car price"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Port
          </label>
          <select
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select destination port</option>
            {ports.map(port => (
              <option key={port.id} value={port.id}>
                {port.name}, {port.country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="container"
                checked={shippingMethod === 'container'}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Container Shipping (Safer, 4-6 weeks)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="roRo"
                checked={shippingMethod === 'roRo'}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">RoRo Shipping (Faster, 2-4 weeks)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Include Shipping Insurance (2% of car value)</span>
          </label>
        </div>

        {totalCost !== null && breakdown && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Cost Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Shipping:</span>
                <span>${breakdown.baseShipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customs Clearance (5%):</span>
                <span>${breakdown.customsClearance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Documentation:</span>
                <span>${breakdown.documentation}</span>
              </div>
              <div className="flex justify-between">
                <span>Inspection:</span>
                <span>${breakdown.inspection}</span>
              </div>
              {breakdown.insurance > 0 && (
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <span>${breakdown.insurance.toLocaleString()}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-green-800">
                <span>Total Cost:</span>
                <span>${totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              * Prices are estimates. Final costs may vary based on exact specifications and current rates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}