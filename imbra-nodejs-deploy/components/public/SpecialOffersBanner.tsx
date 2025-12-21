import React, { useState, useEffect } from 'react';
import { FaFire } from 'react-icons/fa';

const SpecialOffersBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev; // Stop at 0
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-red-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FaFire className="text-yellow-400" size={24} />
          <div>
            <div className="font-bold text-lg">HOT DEAL: 20% OFF on Toyota Prado!</div>
            <div className="text-sm">Limited time offer - ends soon!</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm">Offer ends in:</div>
          <div className="font-mono text-lg">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersBanner;
