import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaSearch } from 'react-icons/fa';

interface Dealer {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  distance: number;
  services: string[];
}

interface Tenant {
  name: string;
  logo?: string;
}

interface DealerLocatorProps {
  className?: string;
  tenant?: Tenant;
}

export default function DealerLocator({ className = '', tenant }: DealerLocatorProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);

  const tenantName = tenant?.name || 'Car Dealership';

  // Mock dealers data
  const mockDealers: Dealer[] = [
    {
      id: '1',
      name: `${tenantName} Tanzania`,
      address: 'Plot 123, Kiko Avenue',
      city: 'Dar es Salaam',
      country: 'Tanzania',
      phone: '+255 22 123 4567',
      email: 'info@dealership.tz',
      website: 'https://dealership.co.tz',
      distance: 0,
      services: ['Sales', 'Service', 'Parts', 'Shipping']
    },
    {
      id: '2',
      name: `${tenantName} Kenya`,
      address: 'Westlands Road, Nairobi',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254 20 123 4567',
      email: 'info@dealership.ke',
      website: 'https://dealership.co.ke',
      distance: 450,
      services: ['Sales', 'Service', 'Parts']
    },
    {
      id: '3',
      name: `${tenantName} Uganda`,
      address: 'Nakasero Road, Kampala',
      city: 'Kampala',
      country: 'Uganda',
      phone: '+256 414 123 456',
      email: 'info@dealership.ug',
      distance: 650,
      services: ['Sales', 'Parts', 'Shipping']
    },
    {
      id: '4',
      name: `${tenantName} Ghana`,
      address: 'Accra Central, Cantonments',
      city: 'Accra',
      country: 'Ghana',
      phone: '+233 30 123 4567',
      email: 'info@dealership.com.gh',
      distance: 1200,
      services: ['Sales', 'Service', 'Parts', 'Shipping']
    }
  ];

  const searchDealers = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDealers(mockDealers.filter(dealer =>
        dealer.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
        dealer.country.toLowerCase().includes(searchLocation.toLowerCase())
      ));
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDealers();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaMapMarkerAlt className="text-red-600" />
        <h3 className="text-lg font-semibold">Find a Dealer</h3>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city or country"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={searchDealers}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSearch />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {dealers.length === 0 && !loading && searchLocation && (
          <div className="text-center py-8 text-gray-500">
            No dealers found in that location. Try searching for a nearby city or country.
          </div>
        )}

        {dealers.map(dealer => (
          <div key={dealer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{dealer.name}</h4>
              <span className="text-sm text-gray-500">{dealer.distance} km away</span>
            </div>

            <div className="text-gray-600 mb-3">
              <p>{dealer.address}</p>
              <p>{dealer.city}, {dealer.country}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {dealer.services.map(service => (
                <span key={service} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {service}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <FaPhone />
                {dealer.phone}
              </a>
              <a href={`mailto:${dealer.email}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <FaEnvelope />
                Email
              </a>
              {dealer.website && (
                <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                  <FaGlobe />
                  Website
                </a>
              )}
            </div>
          </div>
        ))}

        {dealers.length === 0 && !searchLocation && (
          <div className="text-center py-8 text-gray-500">
            <FaMapMarkerAlt className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>Enter a location to find {tenantName} dealers near you</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Dealer Services</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• Vehicle sales & purchases</div>
          <div>• Parts & accessories</div>
          <div>• Service & maintenance</div>
          <div>• Shipping coordination</div>
          <div>• Vehicle inspection</div>
          <div>• Export documentation</div>
        </div>
      </div>
    </div>
  );
}