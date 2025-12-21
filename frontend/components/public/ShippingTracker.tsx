import React, { useState } from 'react';
import { FaTruck, FaSearch, FaCheckCircle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ShippingTracker: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleTrack = () => {
    // Mock tracking data
    if (trackingNumber) {
      setTrackingResult({
        status: 'In Transit',
        location: 'Port of Mombasa, Kenya',
        estimatedDelivery: 'December 15, 2025',
        steps: [
          { status: 'Order Placed', completed: true, date: 'Dec 1, 2025' },
          { status: 'Payment Confirmed', completed: true, date: 'Dec 2, 2025' },
          { status: 'Vehicle Prepared', completed: true, date: 'Dec 5, 2025' },
          { status: 'Shipped from Japan', completed: true, date: 'Dec 8, 2025' },
          { status: 'In Transit', completed: true, date: 'Dec 10, 2025' },
          { status: 'Customs Clearance', completed: false, date: 'Dec 12, 2025' },
          { status: 'Delivered', completed: false, date: 'Dec 15, 2025' }
        ]
      });
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Track Your Shipment</h2>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg"
            />
            <button
              onClick={handleTrack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaSearch /> Track
            </button>
          </div>

          {trackingResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaTruck className="text-blue-600" size={24} />
                  <div>
                    <div className="font-semibold text-gray-900">{trackingResult.status}</div>
                    <div className="text-sm text-gray-600">{trackingResult.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Delivery</div>
                  <div className="font-semibold text-blue-600">{trackingResult.estimatedDelivery}</div>
                </div>
              </div>

              <div className="space-y-4">
                {trackingResult.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? <FaCheckCircle size={16} /> : <FaClock size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.status}
                      </div>
                      <div className="text-sm text-gray-500">{step.date}</div>
                    </div>
                    {step.completed && <FaMapMarkerAlt className="text-green-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShippingTracker;
