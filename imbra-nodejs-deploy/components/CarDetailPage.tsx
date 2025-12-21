// components/CarDetailPage.tsx
import React, { useState } from 'react';
import api from 'utils/api';
import { Heart, ChevronLeft, ChevronRight, Phone, MessageCircle, Mail, MapPin, Calendar, Gauge, Fuel, Settings, Users, Car as CarIcon, Plus } from 'lucide-react';
import { TenantTheme } from '../types/tenant';
import { DealerCar } from '../types/dealerCar';
import { cars } from '../lib/tenantMock';
import { useFavorites } from '../hooks/useFavorites';
import { generateProformaPdfHtml, downloadProformaPdfAsHtmlBlob } from '../lib/pdfMock';

interface CarDetailPageProps {
  tenantTheme: TenantTheme;
  carId: string;
  navigate: (route: string) => void;
}

export default function CarDetailPage({ tenantTheme, carId, navigate }: CarDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const { favorites: favItems, addFavorite, removeFavorite, toggleFavorite: toggleFavoriteItem } = useFavorites();
  const isFavorite = (id: string) => !!favItems.find((i: any) => i.id === id);

  const car = cars.find(c => c.id === carId);
  if (!car) {
    return <div className="text-center py-12">Car not found</div>;
  }

  const toggleFavorite = () => {
    if (isFavorite(car.id)) {
      removeFavorite(car.id);
    } else {
      addFavorite(car.id);
    }
  };

  const addToGarage = async () => {
    try {
      await api.post('/buyer/garage', { carId: car.id });
      alert('Added to your garage');
    } catch (err) {
      alert('Failed to add to garage. Ensure you are logged in.');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + car.images.length) % car.images.length);
  };

  const renderPrice = () => {
    if (!tenantTheme.listing.showPrices) {
      return <button className="text-blue-600 hover:underline text-lg">Get price</button>;
    }
    if (car.currency === 'USD') {
      return <span className="text-3xl font-bold text-green-600">USD {car.price_usd?.toLocaleString()}</span>;
    } else {
      return <span className="text-3xl font-bold text-green-600">{tenantTheme.baseCurrency} {car.price_local_zmw?.toLocaleString()}</span>;
    }
  };

  const buildWhatsAppLink = () => {
    const message = `Hi, I'm interested in the ${car.year} ${car.make} ${car.model} (Stock: ${car.stockNo}). Can you provide more details?`;
    return `https://wa.me/${tenantTheme.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inquiry submitted:', inquiryForm);
    alert('Thank you for your inquiry! We will get back to you soon.');
    setInquiryForm({ name: '', email: '', phone: '', message: '' });
  };

  const similarCars = cars.filter(c => c.id !== car.id && c.make === car.make).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative">
              <img src={car.images[currentImageIndex]} alt={`${car.make} ${car.model}`} className="w-full h-96 object-cover" />
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    title="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    title="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {car.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                        title={`Show image ${index + 1}`}
                        aria-label={`Show image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{car.year} {car.make} {car.model} {car.grade}</h1>
                  <p className="text-gray-600">Stock: {car.stockNo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded ${car.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {car.status}
                  </span>
                  <button onClick={toggleFavorite} className={`p-2 ${isFavorite(car.id) ? 'text-red-500' : 'text-gray-400'}`} title={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"} aria-label={isFavorite(car.id) ? "Remove from favorites" : "Add to favorites"}>
                    <Heart className={`w-6 h-6 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {car.year}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Gauge className="w-4 h-4 mr-1" />
                  {car.mileage_km.toLocaleString()} km
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Fuel className="w-4 h-4 mr-1" />
                  {car.fuel}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Settings className="w-4 h-4 mr-1" />
                  {car.transmission}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CarIcon className="w-4 h-4 mr-1" />
                  {car.engine_cc}cc
                </div>
              </div>
              <div className="flex items-center justify-between">
                {renderPrice()}
                <div className="flex space-x-2">
                  <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center" onClick={() => { addToGarage(); }}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                  <button onClick={addToGarage} className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Garage
                  </button>
                  <button onClick={() => {
                    const html = generateProformaPdfHtml({ dealer: tenantTheme, car, buyer: null });
                    downloadProformaPdfAsHtmlBlob(`proforma-${car.stockNo}.html`, html);
                  }} className="bg-white border px-3 py-2 rounded ml-2 text-sm">Generate Proforma</button>
                  <button onClick={() => navigate(`/checkout/${car.id}`)} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition flex items-center ml-2">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Engine & Performance</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Engine: {car.engine_cc}cc</li>
                  <li>Fuel: {car.fuel}</li>
                  <li>Transmission: {car.transmission}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Dimensions & Capacity</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Steering: {car.steering}</li>
                  <li>Color: {car.color}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Similar Cars */}
          {similarCars.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Cars</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarCars.map(similarCar => (
                  <div key={similarCar.id} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/car/${similarCar.id}`)}>
                    <img src={similarCar.images[0]} alt={`${similarCar.make} ${similarCar.model}`} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{similarCar.year} {similarCar.make} {similarCar.model}</h3>
                      <p className="text-xs text-gray-600">{similarCar.mileage_km.toLocaleString()} km</p>
                      {tenantTheme.listing.showPrices && (
                        <p className="text-sm font-semibold text-green-600">USD {similarCar.price_usd?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Inquiry Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Make an Inquiry</h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={e => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={e => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={e => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. +260971234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={inquiryForm.message}
                  onChange={e => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-2 border rounded h-24 resize-none"
                  placeholder="Tell us what you're looking for..."
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Send Inquiry
              </button>
            </form>
          </div>

          {/* Dealer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Dealer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm">{tenantTheme.location}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm">{tenantTheme.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm">{tenantTheme.email}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm">WhatsApp: {tenantTheme.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}