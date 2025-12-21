import React, { useState, useEffect } from 'react';
import { FaCalculator, FaShip, FaPlane, FaTruck, FaSave, FaCopy, FaPrint, FaDownload } from 'react-icons/fa';

interface CIFCalculation {
  id?: string;
  carId: string;
  customerName?: string;
  
  // Vehicle Details
  carValue: number;
  currency: 'USD' | 'JPY' | 'EUR';
  
  // Origin & Destination
  originPort: string;
  destinationPort: string;
  shippingMethod: 'roro' | 'container';
  
  // Costs
  freight: number;
  insurance: number;
  portCharges: number;
  inspectionFees: number;
  documentationFees: number;
  agentFees: number;
  
  // Customs & Taxes
  importDuty: number;
  exciseDuty: number;
  vat: number;
  
  // Additional Costs
  additionalCosts: Array<{
    description: string;
    amount: number;
  }>;
  
  // Totals
  cifValue: number;
  totalLandingCost: number;
  
  createdAt?: string;
}

interface Port {
  code: string;
  name: string;
  country: string;
}

interface CIFCar {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
}

export default function CIFCalculator() {
  const [calculation, setCalculation] = useState<CIFCalculation>({
    carId: '',
    carValue: 0,
    currency: 'USD',
    originPort: '',
    destinationPort: '',
    shippingMethod: 'roro',
    freight: 0,
    insurance: 0,
    portCharges: 0,
    inspectionFees: 0,
    documentationFees: 0,
    agentFees: 0,
    importDuty: 0,
    exciseDuty: 0,
    vat: 0,
    additionalCosts: [],
    cifValue: 0,
    totalLandingCost: 0
  });

  const [cars, setCars] = useState<CIFCar[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<CIFCalculation[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<string>('');

  // Load initial data
  useEffect(() => {
    setPorts([
      // Zambian Destinations
      { code: 'DAR', name: 'Dar es Salaam', country: 'Tanzania (to Zambia)' },
      { code: 'DUR', name: 'Durban', country: 'South Africa (to Zambia)' },
      { code: 'BEI', name: 'Beira', country: 'Mozambique (to Zambia)' },
      { code: 'WAL', name: 'Walvis Bay', country: 'Namibia (to Zambia)' },
      
      // Origin Ports
      { code: 'YOK', name: 'Yokohama', country: 'Japan' },
      { code: 'TOK', name: 'Tokyo', country: 'Japan' },
      { code: 'KOB', name: 'Kobe', country: 'Japan' },
      { code: 'NAG', name: 'Nagoya', country: 'Japan' },
      { code: 'DUB', name: 'Dubai', country: 'UAE' },
      { code: 'ANT', name: 'Antwerp', country: 'Belgium' },
      { code: 'HAM', name: 'Hamburg', country: 'Germany' },
      { code: 'LON', name: 'London', country: 'UK' },
      { code: 'LAX', name: 'Los Angeles', country: 'USA' }
    ]);
    
    // Load cars and saved calculations
    loadCars();
    loadSavedCalculations();
  }, []);

  const loadCars = async () => {
    try {
      // TODO: Replace with actual API call
      setCars([
        { id: '1', stockNo: 'CAR001', make: 'Toyota', model: 'Camry', year: 2020, priceUsd: 15000 },
        { id: '2', stockNo: 'CAR002', make: 'Honda', model: 'Civic', year: 2019, priceUsd: 12000 }
      ]);
    } catch (error) {
      console.error('Failed to load cars:', error);
    }
  };

  const loadSavedCalculations = async () => {
    try {
      const response = await fetch('/api/cif/calculations', {
        headers: {
          'x-tenant-id': 'tenant_123' // TODO: Get from auth context
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedCalculations(data.calculations || []);
      }
    } catch (error) {
      console.error('Failed to load saved calculations:', error);
    }
  };

  // Auto-calculate CIF and total costs when values change
  useEffect(() => {
    const cifValue = calculation.carValue + calculation.freight + calculation.insurance;
    const customsDuties = calculation.importDuty + calculation.exciseDuty + calculation.vat;
    const otherCosts = calculation.portCharges + calculation.inspectionFees + 
                      calculation.documentationFees + calculation.agentFees;
    const additionalTotal = calculation.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalLandingCost = cifValue + customsDuties + otherCosts + additionalTotal;

    setCalculation(prev => ({
      ...prev,
      cifValue,
      totalLandingCost
    }));
  }, [
    calculation.carValue, calculation.freight, calculation.insurance,
    calculation.importDuty, calculation.exciseDuty, calculation.vat,
    calculation.portCharges, calculation.inspectionFees,
    calculation.documentationFees, calculation.agentFees,
    calculation.additionalCosts
  ]);

  const handleCarSelect = (carId: string) => {
    const selectedCar = cars.find((car: any) => car.id === carId);
    if (selectedCar) {
      setCalculation(prev => ({
        ...prev,
        carId,
        carValue: (selectedCar as any).priceUsd
      }));
    }
  };

  const addAdditionalCost = () => {
    setCalculation(prev => ({
      ...prev,
      additionalCosts: [...prev.additionalCosts, { description: '', amount: 0 }]
    }));
  };

  const updateAdditionalCost = (index: number, field: 'description' | 'amount', value: string | number) => {
    setCalculation(prev => ({
      ...prev,
      additionalCosts: prev.additionalCosts.map((cost, i) => 
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const removeAdditionalCost = (index: number) => {
    setCalculation(prev => ({
      ...prev,
      additionalCosts: prev.additionalCosts.filter((_, i) => i !== index)
    }));
  };

  const autoCalculateShipping = async () => {
    if (!calculation.originPort || !calculation.destinationPort || !calculation.carValue) {
      alert('Please select origin port, destination port, and enter car value first');
      return;
    }

    try {
      const response = await fetch(`/api/cif/shipping-rates?origin=${calculation.originPort}&destination=${calculation.destinationPort}&method=${calculation.shippingMethod}&carValue=${calculation.carValue}`);
      const ratesData = await response.json();

      if (!response.ok) {
        throw new Error(ratesData.error || 'Failed to calculate shipping rates');
      }

      setCalculation(prev => ({
        ...prev,
        freight: ratesData.costs.freight,
        insurance: ratesData.costs.insurance,
        portCharges: ratesData.costs.portCharges,
        inspectionFees: ratesData.costs.inspectionFees,
        documentationFees: ratesData.costs.documentationFees,
        agentFees: ratesData.costs.agentFees,
        importDuty: ratesData.costs.importDuty,
        exciseDuty: ratesData.costs.exciseDuty,
        vat: ratesData.costs.vat
      }));

      alert(`Shipping rates calculated for ${ratesData.route}! Estimated transit: ${ratesData.estimatedTransitDays} days`);
    } catch (error) {
      console.error('Auto-calculate shipping error:', error);
      alert('Failed to calculate shipping rates. Please enter values manually.');
    }
  };

  const saveCalculation = async () => {
    try {
      const response = await fetch('/api/cif/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant_123', // TODO: Get from auth context
          'x-user-id': 'user_123' // TODO: Get from auth context
        },
        body: JSON.stringify(calculation)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save calculation');
      }

      const savedCalc = await response.json();
      setSavedCalculations(prev => [savedCalc, ...prev]);
      alert('Calculation saved successfully!');
    } catch (error) {
      console.error('Save calculation error:', error);
      alert('Failed to save calculation. Please try again.');
    }
  };

  const loadCalculation = (calcId: string) => {
    const saved = savedCalculations.find(c => c.id === calcId);
    if (saved) {
      setCalculation(saved);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaCalculator className="text-blue-600" />
                CIF Calculator
              </h1>
              <p className="text-gray-600 mt-2">Calculate Cost, Insurance & Freight for vehicle imports</p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCalculation}
                onChange={(e) => {
                  setSelectedCalculation(e.target.value);
                  if (e.target.value) loadCalculation(e.target.value);
                }}
                className="border rounded px-3 py-2"
              >
                <option value="">Load Saved Calculation</option>
                {savedCalculations.map(calc => (
                  <option key={calc.id} value={calc.id}>
                    {calc.customerName || `Calc ${calc.id?.slice(-4)}`} - ${calc.createdAt?.split('T')[0]}
                  </option>
                ))}
              </select>
              
              <button
                onClick={saveCalculation}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Vehicle</label>
                  <select
                    value={calculation.carId}
                    onChange={(e) => handleCarSelect(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a vehicle</option>
                    {cars.map((car: any) => (
                      <option key={car.id} value={car.id}>
                        {car.stockNo} - {car.make} {car.model} {car.year} (${car.priceUsd?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={calculation.customerName || ''}
                    onChange={(e) => setCalculation(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Customer name for this calculation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Car Value</label>
                  <div className="flex">
                    <select
                      value={calculation.currency}
                      onChange={(e) => setCalculation(prev => ({ ...prev, currency: e.target.value as any }))}
                      className="border rounded-l px-3 py-2 bg-gray-50"
                    >
                      <option value="USD">USD</option>
                      <option value="JPY">JPY</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input
                      type="number"
                      value={calculation.carValue}
                      onChange={(e) => setCalculation(prev => ({ ...prev, carValue: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 border-t border-b border-r rounded-r px-3 py-2"
                      placeholder="Vehicle value"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaShip className="text-blue-600" />
                Shipping Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin Port</label>
                  <select
                    value={calculation.originPort}
                    onChange={(e) => setCalculation(prev => ({ ...prev, originPort: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select origin port</option>
                    {ports.filter(p => !p.country.includes('to Zambia')).map(port => (
                      <option key={port.code} value={port.code}>
                        {port.name}, {port.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Destination Port</label>
                  <select
                    value={calculation.destinationPort}
                    onChange={(e) => setCalculation(prev => ({ ...prev, destinationPort: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select destination port</option>
                    {ports.filter(p => p.country.includes('to Zambia')).map(port => (
                      <option key={port.code} value={port.code}>
                        {port.name}, {port.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Method</label>
                  <select
                    value={calculation.shippingMethod}
                    onChange={(e) => setCalculation(prev => ({ ...prev, shippingMethod: e.target.value as any }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="roro">RoRo (Roll-on/Roll-off)</option>
                    <option value="container">Container Shipping</option>
                  </select>
                </div>
              </div>

              <button
                onClick={autoCalculateShipping}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                disabled={!calculation.originPort || !calculation.destinationPort}
              >
                <FaCalculator /> Auto-Calculate Shipping Costs
              </button>
            </div>

            {/* Shipping Costs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Costs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Freight Cost</label>
                  <input
                    type="number"
                    value={calculation.freight}
                    onChange={(e) => setCalculation(prev => ({ ...prev, freight: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Insurance</label>
                  <input
                    type="number"
                    value={calculation.insurance}
                    onChange={(e) => setCalculation(prev => ({ ...prev, insurance: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Port Charges</label>
                  <input
                    type="number"
                    value={calculation.portCharges}
                    onChange={(e) => setCalculation(prev => ({ ...prev, portCharges: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Inspection Fees</label>
                  <input
                    type="number"
                    value={calculation.inspectionFees}
                    onChange={(e) => setCalculation(prev => ({ ...prev, inspectionFees: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Documentation</label>
                  <input
                    type="number"
                    value={calculation.documentationFees}
                    onChange={(e) => setCalculation(prev => ({ ...prev, documentationFees: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Agent Fees</label>
                  <input
                    type="number"
                    value={calculation.agentFees}
                    onChange={(e) => setCalculation(prev => ({ ...prev, agentFees: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Customs & Taxes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Customs & Taxes (Zambia)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Import Duty (25%)</label>
                  <input
                    type="number"
                    value={calculation.importDuty}
                    onChange={(e) => setCalculation(prev => ({ ...prev, importDuty: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Excise Duty (10%)</label>
                  <input
                    type="number"
                    value={calculation.exciseDuty}
                    onChange={(e) => setCalculation(prev => ({ ...prev, exciseDuty: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">VAT (16%)</label>
                  <input
                    type="number"
                    value={calculation.vat}
                    onChange={(e) => setCalculation(prev => ({ ...prev, vat: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Costs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Additional Costs</h3>
                <button
                  onClick={addAdditionalCost}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Add Cost
                </button>
              </div>
              
              {calculation.additionalCosts.map((cost, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cost.description}
                    onChange={(e) => updateAdditionalCost(index, 'description', e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={cost.amount}
                    onChange={(e) => updateAdditionalCost(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-32 border rounded px-3 py-2"
                    placeholder="Amount"
                  />
                  <button
                    onClick={() => removeAdditionalCost(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Calculation Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Car Value:</span>
                  <span className="font-medium">${calculation.carValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Freight:</span>
                  <span className="font-medium">${calculation.freight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium">${calculation.insurance.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold text-blue-600">
                    <span>CIF Value:</span>
                    <span>${calculation.cifValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Duties & Taxes</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Import Duty:</span>
                  <span className="font-medium">${calculation.importDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Excise Duty:</span>
                  <span className="font-medium">${calculation.exciseDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT:</span>
                  <span className="font-medium">${calculation.vat.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Other Costs</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Port Charges:</span>
                  <span className="font-medium">${calculation.portCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inspection:</span>
                  <span className="font-medium">${calculation.inspectionFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documentation:</span>
                  <span className="font-medium">${calculation.documentationFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent Fees:</span>
                  <span className="font-medium">${calculation.agentFees.toLocaleString()}</span>
                </div>
                {calculation.additionalCosts.map((cost, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{cost.description || `Additional ${index + 1}`}:</span>
                    <span className="font-medium">${cost.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Total Landing Cost</h3>
              <div className="text-3xl font-bold">${calculation.totalLandingCost.toLocaleString()}</div>
              <p className="text-green-100 mt-2">Final cost delivered to Zambia</p>
              
              <div className="flex gap-2 mt-4">
                <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded flex items-center gap-2 text-sm">
                  <FaCopy /> Copy
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded flex items-center gap-2 text-sm">
                  <FaPrint /> Print
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded flex items-center gap-2 text-sm">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
