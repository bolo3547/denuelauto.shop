import React from 'react';
import { FaEye, FaShoppingCart, FaUsers } from 'react-icons/fa';

const SocialProofWidgets: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaEye className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">247</div>
            <div className="text-sm text-gray-600">People viewing now</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-full">
            <FaShoppingCart className="text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Cars sold today</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-full">
            <FaUsers className="text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">1,250+</div>
            <div className="text-sm text-gray-600">Happy customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofWidgets;
