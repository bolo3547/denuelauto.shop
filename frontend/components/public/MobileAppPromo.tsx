import React, { useState } from 'react';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';

const MobileAppPromo: React.FC = () => {
  const [show, setShow] = useState(true);

  const handleDownload = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';

    // Check if it's iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as Window & { MSStream?: boolean }).MSStream) {
      // Redirect to App Store - Replace with your actual App Store URL
      window.location.href = 'https://apps.apple.com/app/your-app-id';
    }
    // Check if it's Android
    else if (/android/i.test(userAgent)) {
      // Redirect to Google Play Store - Replace with your actual Play Store URL
      window.location.href = 'https://play.google.com/store/apps/details?id=com.yourapp';
    }
    // Desktop or other platforms
    else {
      // For desktop, show instructions
      alert('Please visit this page on your mobile device to download our app, or scan the QR code on our website.');
    }
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FaMobileAlt size={32} className="text-yellow-400" />
          <div>
            <h3 className="font-bold text-lg">Download Our Mobile App!</h3>
            <p className="text-sm">Browse cars on the go, get instant notifications, and track your orders.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownload}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Download Now
          </button>
          <button
            type="button"
            title="Close promo"
            onClick={() => setShow(false)}
            className="text-white/70 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppPromo;
