import React, { useState, useEffect } from 'react';
import { 
  FaHeart, FaShare, FaWhatsapp, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaCar, FaGasPump, FaCogs,
  FaTachometerAlt, FaChevronLeft,
  FaChevronRight, FaExpand, FaStar, FaComment,
  FaShieldAlt, FaHistory,
  FaCalculator, FaEye
} from 'react-icons/fa';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  description?: string;
  images: Array<{ url: string; caption?: string }>;
  features: string[];
  engineSize?: string;
  doors?: number;
  seats?: number;
  driveType?: string;
  condition?: string;
  vin?: string;
  inspectionDate?: string;
  exportCertificate?: boolean;
  isFavorited?: boolean;
  _count?: {
    favorites: number;
    views: number;
    inquiries: number;
  };
}

interface Dealer {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface CarDetailsProps {
  carId: string;
  tenantSlug: string;
  buyerId?: string;
  onClose?: () => void;
}

export default function CarDetails({ carId, tenantSlug, buyerId, onClose }: CarDetailsProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [inquiryForm, setInquiryForm] = useState({
    type: 'CAR_SPECIFIC',
    subject: '',
    message: '',
    contactPreference: 'EMAIL'
  });

  const loadCarDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/public/cars/${carId}?tenantSlug=${tenantSlug}`);
      const data = await response.json();

      if (response.ok) {
        setCar(data.car);
        setDealer(data.dealer);
        setSimilarCars(data.similarCars);
      } else {
        console.error('Failed to load car details:', data.error);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    } finally {
      setLoading(false);
    }
  }, [carId, tenantSlug]);

  useEffect(() => {
    loadCarDetails();
  }, [loadCarDetails]);

  const toggleFavorite = async () => {
    if (!buyerId || !car) return;

    try {
      const method = car.isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/buyers/favorites`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('buyerToken')}`
        },
        body: JSON.stringify({ buyerId, carId: car.id })
      });

      if (response.ok) {
        setCar(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerId || !car) return;

    try {
      const response = await fetch('/api/buyers/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('buyerToken')}`
        },
        body: JSON.stringify({
          buyerId,
          carId: car.id,
          ...inquiryForm
        })
      });

      if (response.ok) {
        setShowInquiryForm(false);
        setInquiryForm({
          type: 'CAR_SPECIFIC',
          subject: '',
          message: '',
          contactPreference: 'EMAIL'
        });
        alert('Inquiry sent successfully!');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const shareVehicle = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car?.make} ${car?.model} ${car?.year}`,
        text: `Check out this ${car?.make} ${car?.model} for ${formatCurrency(car?.price || 0)}`,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car || !dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Car not found</p>
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header with breadcrumb */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Go Back"
                  >
                    <FaChevronLeft />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {car.make} {car.model} {car.year}
                  </h1>
                  <p className="text-gray-600">Stock: {car.stockNo} • {dealer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(car.price)}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full ${
                      car.isFavorited 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-400 hover:text-red-600'
                    }`}
                    aria-label={car.isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <FaHeart className={car.isFavorited ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={shareVehicle}
                    className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                    aria-label="Share vehicle"
                  >
                    <FaShare />
                  </button>
                  <button className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700" aria-label="WhatsApp Dealer">
                    <FaWhatsapp />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img
                    src={car.images[selectedImageIndex]?.url || '/api/placeholder/800/400'}
                    alt={`${car.make} ${car.model} - ${selectedImageIndex + 1}`}
                    className="w-full h-96 object-cover cursor-pointer"
                  />
                  <button
                    onClick={() => setShowImageGallery(true)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    aria-label="Expand image gallery"
                  >
                    <FaExpand />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {car.images.length}
                  </div>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(car.images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === car.images.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30"
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                
                {/* Thumbnail Gallery */}
                {car.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {car.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === selectedImageIndex ? 'border-blue-600' : 'border-gray-200'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <img
                            src={image.url}
                            alt={`Thumbnail of ${car.make} ${car.model} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b">
                  <div className="flex" role="tablist" aria-label="Car details tabs">
                    {[
                      { id: 'overview', label: 'Overview', icon: FaCar },
                      { id: 'specifications', label: 'Specifications', icon: FaCogs },
                      { id: 'features', label: 'Features', icon: FaStar },
                      { id: 'history', label: 'History', icon: FaHistory }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                      >
                        <tab.icon />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6" role="tabpanel" aria-labelledby={activeTab}>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <p className="text-gray-700">
                          {car.description || `This ${car.make} ${car.model} ${car.year} is in excellent condition and ready for export. Located in ${car.location}, this vehicle comes with all necessary documentation for international shipping.`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaTachometerAlt className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                          <p className="font-medium">{car.mileage?.toLocaleString()} km</p>
                          <p className="text-sm text-gray-600">Mileage</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaGasPump className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                          <p className="font-medium">{car.fuelType}</p>
                          <p className="text-sm text-gray-600">Fuel Type</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaCogs className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                          <p className="font-medium">{car.transmission}</p>
                          <p className="text-sm text-gray-600">Transmission</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaMapMarkerAlt className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                          <p className="font-medium">{car.location}</p>
                          <p className="text-sm text-gray-600">Location</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Basic Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Make:</span>
                            <span className="font-medium">{car.make}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Model:</span>
                            <span className="font-medium">{car.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Year:</span>
                            <span className="font-medium">{car.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Body Type:</span>
                            <span className="font-medium">{car.bodyType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Color:</span>
                            <span className="font-medium">{car.color}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Engine:</span>
                            <span className="font-medium">{car.engineSize || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Drive Type:</span>
                            <span className="font-medium">{car.driveType || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Doors:</span>
                            <span className="font-medium">{car.doors || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Seats:</span>
                            <span className="font-medium">{car.seats || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Condition:</span>
                            <span className="font-medium">{car.condition || 'Good'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div>
                      <h4 className="font-semibold mb-4">Equipment & Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {car.features.length > 0 ? (
                          car.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <FaStar className="text-green-500 text-sm" />
                              <span>{feature}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 col-span-2">No specific features listed.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Vehicle Information</h4>
                        <div className="space-y-3">
                          {car.vin && (
                            <div className="flex justify-between">
                              <span>VIN:</span>
                              <span className="font-mono">{car.vin}</span>
                            </div>
                          )}
                          {car.inspectionDate && (
                            <div className="flex justify-between">
                              <span>Last Inspection:</span>
                              <span>{formatDate(car.inspectionDate)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Export Certificate:</span>
                            <span className={`font-medium ${car.exportCertificate ? 'text-green-600' : 'text-gray-600'}`}>
                              {car.exportCertificate ? 'Available' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FaShieldAlt className="text-green-600" />
                          <div>
                            <h5 className="font-semibold text-green-800">Verified Dealer</h5>
                            <p className="text-sm text-green-700">
                              This vehicle is sold by a verified dealer with proper documentation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                  >
                    <FaComment /> Send Inquiry
                  </button>
                  
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium">
                    <FaWhatsapp /> WhatsApp Dealer
                  </button>
                  
                  <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 font-medium">
                    <FaCalculator /> Get Shipping Quote
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Interested in this car?</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200">
                        <FaPhone className="inline mr-1" /> Call
                      </button>
                      <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200">
                        <FaEnvelope className="inline mr-1" /> Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Dealer Information</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{dealer.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar key={star} className="text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(4.8/5)</span>
                    </div>
                  </div>
                  
                  {dealer.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className="text-gray-400" />
                      <span>{dealer.contactPhone}</span>
                    </div>
                  )}
                  
                  {dealer.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaEnvelope className="text-gray-400" />
                      <span>{dealer.contactEmail}</span>
                    </div>
                  )}
                  
                  <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                    View All Inventory
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              {car._count && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Popularity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <FaEye className="text-gray-400" />
                        Views
                      </span>
                      <span className="font-medium">{car._count.views}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <FaHeart className="text-red-400" />
                        Favorites
                      </span>
                      <span className="font-medium">{car._count.favorites}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <FaComment className="text-blue-400" />
                        Inquiries
                      </span>
                      <span className="font-medium">{car._count.inquiries}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Cars */}
          {similarCars.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Cars</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarCars.map((similarCar) => (
                  <button key={similarCar.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left">
                    <img
                      src={similarCar.images[0]?.url || '/api/placeholder/300/200'}
                      alt={`View details for ${similarCar.make} ${similarCar.model}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">
                        {similarCar.make} {similarCar.model} {similarCar.year}
                      </h3>
                      <p className="text-blue-600 font-bold text-lg mt-1">
                        {formatCurrency(similarCar.price)}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                        <span>{similarCar.mileage?.toLocaleString()} km</span>
                        <span>{similarCar.location}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button
                onClick={() => setShowInquiryForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                aria-label="Close inquiry form"
              >
                <FaChevronLeft />
              </button>
              <form onSubmit={submitInquiry} className="space-y-4">
                <div>
                  <label htmlFor="inquiry-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiry-type"
                    title="Inquiry Type"
                    value={inquiryForm.type}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="CAR_SPECIFIC">About This Car</option>
                    <option value="SHIPPING">Shipping Information</option>
                    <option value="PAYMENT">Payment Options</option>
                    <option value="GENERAL">General Question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inquiry-subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    id="inquiry-subject"
                    type="text"
                    value={inquiryForm.subject}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={`Inquiry about ${car.make} ${car.model} ${car.year}`}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="inquiry-message"
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please provide details about your inquiry..."
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-contact-preference" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    id="inquiry-contact-preference"
                    title="Preferred Contact Method"
                    value={inquiryForm.contactPreference}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, contactPreference: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Gallery Modal */}
        {showImageGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
              aria-label="Close gallery"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-70 disabled:opacity-30"
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <img
              src={car.images[selectedImageIndex]?.url || '/api/placeholder/800/400'}
              alt={`Full screen view of ${car.make} ${car.model} - ${selectedImageIndex + 1}`}
              className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setSelectedImageIndex(Math.min(car.images.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex === car.images.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-70 disabled:opacity-30"
              aria-label="Next image"
            >
              <FaChevronRight />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded">
              {selectedImageIndex + 1} / {car.images.length}
            </div>
          </div>
        )}
      </div>
    </>
  );
}