import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaLock } from 'react-icons/fa';

interface CarReservationProps {
  carId?: string;
  carName?: string;
  className?: string;
}

export default function CarReservation({ carId = '123', carName = 'Toyota Corolla 2018', className = '' }: CarReservationProps) {
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [duration, setDuration] = useState('24'); // hours
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call
    const mockReservationId = 'RSV' + Date.now();
    setReservationId(mockReservationId);
    setIsSubmitted(true);

    // In real app, send data to backend
    console.log('Reservation submitted:', {
      carId,
      reservationDate,
      reservationTime,
      duration,
      contactName,
      contactEmail,
      contactPhone,
      notes
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow reservations up to 30 days ahead
    return maxDate.toISOString().split('T')[0];
  };

  if (isSubmitted && reservationId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 text-center ${className}`}>
        <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-600 mb-2">Reservation Confirmed!</h3>
        <p className="text-gray-600 mb-4">
          Your car has been reserved successfully. A confirmation email has been sent to {contactEmail}.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="font-semibold">Reservation ID: {reservationId}</p>
          <p className="text-sm text-gray-600">Vehicle: {carName}</p>
        </div>
        <div className="text-sm text-gray-500">
          <p>• The car will be held for your exclusive purchase</p>
          <p>• Reservation is valid for {duration} hours</p>
          <p>• Contact our team if you need to modify or cancel</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaLock className="text-orange-600" />
        <h3 className="text-lg font-semibold">Reserve This Car</h3>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-orange-800">
          <strong>Car Reservation:</strong> Hold this vehicle for your exclusive purchase.
          Reservation fee: $100 (refundable upon purchase).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Reservation Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservation Date *
              </label>
              <input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time *
              </label>
              <select
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reservation Duration *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="24">24 hours ($100)</option>
              <option value="48">48 hours ($150)</option>
              <option value="72">72 hours ($200)</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Contact Information</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Any special requests or questions..."
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Reservation Terms</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Reservation fee is fully refundable if you purchase the vehicle</li>
            <li>• Car will be held exclusively for you during reservation period</li>
            <li>• You can cancel reservation up to 12 hours before pickup</li>
            <li>• Final purchase must be completed within reservation period</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-semibold flex items-center justify-center gap-2"
        >
          <FaCalendarAlt />
          Reserve Car - $100
        </button>
      </form>
    </div>
  );
}