import React from 'react';

type Buyer = { firstName?: string };

interface Props {
  buyer?: Buyer | null;
}

const PublicRightSidebar: React.FC<Props> = ({ buyer }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded border">
        <p className="text-sm font-semibold">Top Sellers</p>
        <ul className="text-sm mt-2 space-y-2">
          <li>HONDA Fit for Sale</li>
          <li>TOYOTA Hiace Van for Sale</li>
          <li>MAZDA CX-5 for Sale</li>
          <li>MERCEDES-BENZ C-Class for Sale</li>
        </ul>
      </div>

      <div className="bg-white p-4 rounded border">
        <p className="text-sm font-semibold">Featured Deals</p>
        <div className="mt-3 space-y-3">
          <div className="flex gap-3 items-center">
            <img src="/api/placeholder/80/60" alt="deal" className="w-20 h-12 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold text-sm">2015 Toyota Prius</div>
              <div className="text-xs text-gray-500">$4,500 • JDM</div>
            </div>
            <div className="text-blue-600 font-semibold">Shop</div>
          </div>

          <div className="flex gap-3 items-center">
            <img src="/api/placeholder/80/60" alt="deal" className="w-20 h-12 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold text-sm">2012 Honda Fit</div>
              <div className="text-xs text-gray-500">$3,700 • JDM</div>
            </div>
            <div className="text-blue-600 font-semibold">Shop</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded border text-sm">
        <p className="font-semibold">Contact</p>
        <p className="text-xs text-gray-600">top@beforward.jp • +81 42 440 3440</p>
      </div>

      {buyer && (
        <div className="bg-white p-4 rounded border">
          <p className="font-semibold text-sm">My Account</p>
          <p className="text-sm mt-2">Welcome back, {buyer.firstName}</p>
          <div className="text-sm mt-3 text-gray-500">Manage your profile and purchases</div>
        </div>
      )}
    </div>
  );
};

export default PublicRightSidebar;
