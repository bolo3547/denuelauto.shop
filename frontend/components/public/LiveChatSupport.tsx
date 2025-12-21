import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const LiveChatSupport: React.FC = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/1234567890?text=Hi, I need help with car purchase', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleWhatsApp}
        className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        aria-label="Contact via WhatsApp"
      >
        <FaWhatsapp size={24} />
        <span className="hidden md:inline">Chat Support</span>
      </button>
    </div>
  );
};

export default LiveChatSupport;
