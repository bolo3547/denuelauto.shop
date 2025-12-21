import React, { useState } from 'react';
import { FaShip } from 'react-icons/fa';

const countries = [
  { name: 'Zambia', ports: ['Lusaka Port', 'Ndola Port'], shippingCost: 1200 },
  { name: 'Kenya', ports: ['Mombasa Port', 'Nairobi Port'], shippingCost: 1100 },
  { name: 'Tanzania', ports: ['Dar es Salaam Port', 'Zanzibar Port'], shippingCost: 1300 },
  { name: 'Uganda', ports: ['Kampala Port', 'Entebbe Port'], shippingCost: 1250 },
];

interface CountryPortSelectorProps {
  onSelect: (country: string, port: string, cost: number) => void;
}

const CountryPortSelector: React.FC<CountryPortSelectorProps> = ({ onSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPort, setSelectedPort] = useState('');

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedPort('');
  };

  const handlePortChange = (port: string) => {
    setSelectedPort(port);
    const countryData = countries.find(c => c.name === selectedCountry);
    if (countryData) {
      onSelect(selectedCountry, port, countryData.shippingCost);
    }
  };

  const selectedCountryData = countries.find(c => c.name === selectedCountry);

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <FaShip /> Select Destination Country & Port
      </h3>
      <div className="space-y-2">
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
        {selectedCountryData && (
          <select
            value={selectedPort}
            onChange={(e) => handlePortChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Port</option>
            {selectedCountryData.ports.map(port => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        )}
        {selectedPort && selectedCountryData && (
          <div className="text-sm text-gray-600">
            Estimated shipping cost: ${selectedCountryData.shippingCost.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPortSelector;
