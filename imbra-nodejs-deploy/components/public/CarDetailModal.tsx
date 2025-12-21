import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaHeart, FaShare, FaStar, FaCalculator, FaPhone, FaEnvelope } from 'react-icons/fa';

interface CarDetailModalProps {
  car: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToFavorites?: (car: any) => void;
  isFavorite?: boolean;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, isOpen, onClose, onAddToFavorites, isFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !car) return null;

  // Mock additional images
  const images = [
    car.image,
    '/api/placeholder/600/400?car2',
    '/api/placeholder/600/400?car3',
    '/api/placeholder/600/400?car4'
  ];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const specs = {
    'Engine': '2.0L 4-Cylinder',
    'Horsepower': '150 hp',
    'Torque': '140 lb-ft',
    'Fuel Economy': '25 mpg city / 32 mpg highway',
    'Seating Capacity': '5 passengers',
    'Cargo Space': '15.1 cu ft',
    'Dimensions': '177.3" L x 70.7" W x 58.1" H',
    'Weight': '3,085 lbs',
    'Drive Type': 'Front-wheel drive',
    'Transmission': 'CVT Automatic'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{car.make} {car.model}</h2>
            <p className="text-gray-600">{car.year} • Stock #{car.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onAddToFavorites?.(car)}
              className={`p-2 rounded-full ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`}
            >
              <FaHeart />
            </button>
            <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <FaShare />
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Image Gallery */}
          <div className="lg:w-1/2 p-6">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={`${car.make} ${car.model}`}
                className="w-full h-64 lg:h-80 object-cover rounded-lg"
              />
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`View ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            {/* Price and Rating */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">${car.priceUsd.toLocaleString()}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < (car.rating || 4) ? 'text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.2) • 127 reviews</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex gap-4">
                {['overview', 'specs', 'features', 'inspection'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-1 capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Mileage:</strong> {car.mileage?.toLocaleString() || '25,000'} km</div>
                    <div><strong>Fuel:</strong> {car.fuel || 'Petrol'}</div>
                    <div><strong>Transmission:</strong> {car.transmission || 'Automatic'}</div>
                    <div><strong>Color:</strong> White</div>
                    <div><strong>Location:</strong> Yokohama, Japan</div>
                    <div><strong>Status:</strong> Available</div>
                  </div>
                  <p className="text-gray-700">
                    This {car.year} {car.make} {car.model} is in excellent condition with low mileage.
                    Fully inspected and ready for export with all necessary documentation.
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Air Conditioning', 'Power Steering', 'Power Windows', 'ABS Brakes',
                    'Airbags', 'Central Locking', 'Alloy Wheels', 'CD Player',
                    'Bluetooth', 'Backup Camera', 'Cruise Control', 'Keyless Entry'
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✓ Full Inspection Completed</h4>
                    <p className="text-sm text-green-700">
                      This vehicle has passed a comprehensive 200-point inspection by certified mechanics.
                      Detailed report available upon request.
                    </p>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Download Inspection Report
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                <FaCalculator /> Get Financing Quote
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2">
                <FaPhone /> Request Quote
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2">
                <FaEnvelope /> Email Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal;
