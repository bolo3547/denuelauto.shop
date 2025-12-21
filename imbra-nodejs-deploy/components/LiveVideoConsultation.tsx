'use client';

"use client";

import React, { useState } from 'react';
import { Video, Calendar, Clock, User, Phone, MessageCircle } from 'lucide-react';

interface LiveVideoConsultationProps {
  className?: string;
}

export default function LiveVideoConsultation({ className = '' }: LiveVideoConsultationProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    preferredCar: ''
  });

  const availableSlots = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true }
  ];

  const handleBooking = async () => {
    if (!selectedTime || !customerInfo.name || !customerInfo.email) return;

    setIsBooking(true);

    // Simulate booking API call
    setTimeout(() => {
      alert(`Video consultation booked for ${selectedTime} tomorrow! We'll send you a confirmation email with the meeting link.`);
      setIsBooking(false);
      setSelectedTime('');
      setCustomerInfo({ name: '', email: '', phone: '', preferredCar: '' });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Video className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Live Video Consultation</h3>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Connect face-to-face with our expert sales team. Get personalized recommendations,
          ask questions about specific cars, and get financing advice - all from the comfort of your home.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Video className="w-4 h-4 text-green-600" />
            <span>HD Video Call</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>30 Minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-purple-600" />
            <span>Expert Advisor</span>
          </div>
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Available Times (Tomorrow)</h4>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && setSelectedTime(slot.time)}
              disabled={!slot.available}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedTime === slot.time
                  ? 'bg-blue-600 text-white'
                  : slot.available
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Information Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+260 XXX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interested in (Optional)</label>
          <input
            type="text"
            value={customerInfo.preferredCar}
            onChange={(e) => handleInputChange('preferredCar', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Toyota Camry, SUV under $30k"
          />
        </div>
      </div>

      {/* Book Consultation Button */}
      <button
        onClick={handleBooking}
        disabled={isBooking || !selectedTime || !customerInfo.name || !customerInfo.email}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isBooking ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Booking Consultation...
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            Book Video Consultation
          </>
        )}
      </button>

      {/* Alternative Contact Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Other Ways to Connect</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://wa.me/260971234567?text=Hi, I'd like to schedule a video consultation"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">WhatsApp</span>
          </a>

          <a
            href="tel:+260971234567"
            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Phone Call</span>
          </a>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* By booking a consultation, you agree to receive communication about your inquiry.</p>
        <p>* Video calls are conducted via secure, encrypted platforms.</p>
      </div>
    </div>
  );
}