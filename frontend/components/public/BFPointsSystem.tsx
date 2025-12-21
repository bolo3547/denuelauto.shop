"use client";
import React, { useState, useEffect } from 'react';
import { FaCoins, FaGift, FaStar, FaTrophy, FaShoppingCart, FaCar, FaExchangeAlt } from 'react-icons/fa';

interface PointsHistoryItem {
  id: number;
  action: string;
  points: number;
  date: string;
  type: 'earn' | 'redeem';
}

interface RewardItem {
  id: number;
  name: string;
  points: number;
  description: string;
  image: string;
}

interface BFPointsSystemProps {
  buyer?: Record<string, unknown>;
  tenantSlug: string;
}

const BFPointsSystem: React.FC<BFPointsSystemProps> = ({ buyer, tenantSlug }) => {
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    if (buyer) {
      setPoints(1250);
      setPointsHistory([
        { id: 1, action: 'Car Purchase', points: 500, date: '2024-01-15', type: 'earn' },
        { id: 2, action: 'Referral Bonus', points: 200, date: '2024-01-10', type: 'earn' },
        { id: 3, action: 'Points Redeemed', points: -300, date: '2024-01-08', type: 'redeem' },
        { id: 4, action: 'Review Submitted', points: 50, date: '2024-01-05', type: 'earn' }
      ]);
      setRewards([
        { id: 1, name: 'Free Car Wash', points: 200, description: 'Professional car wash service', image: '🧽' },
        { id: 2, name: '$50 Discount', points: 500, description: 'Discount on your next purchase', image: '💰' },
        { id: 3, name: 'Priority Support', points: 300, description: '24/7 priority customer support', image: '📞' },
        { id: 4, name: 'Free Shipping Insurance', points: 400, description: 'Insurance for your car shipment', image: '🛡️' },
        { id: 5, name: 'VIP Event Access', points: 1000, description: 'Exclusive access to VIP events', image: '🎉' }
      ]);
    }
  }, [buyer]);

  const earnPointsActivities = [
    { icon: <FaShoppingCart />, activity: 'Purchase a car', points: '500-2000 points' },
    { icon: <FaCar />, activity: 'Test drive completed', points: '100 points' },
    { icon: <FaExchangeAlt />, activity: 'Refer a friend', points: '200 points' },
    { icon: <FaStar />, activity: 'Leave a review', points: '50 points' },
    { icon: <FaTrophy />, activity: 'Complete profile', points: '100 points' }
  ];

  const pointsTiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 999, benefits: ['Basic support', 'Standard shipping'] },
    { name: 'Silver', minPoints: 1000, maxPoints: 4999, benefits: ['Priority support', 'Free basic inspection', '5% discount'] },
    { name: 'Gold', minPoints: 5000, maxPoints: 9999, benefits: ['VIP support', 'Free premium inspection', '10% discount', 'Free shipping insurance'] },
    { name: 'Platinum', minPoints: 10000, maxPoints: Infinity, benefits: ['Dedicated account manager', 'Free full service', '15% discount', 'Free upgrades'] }
  ];

  const getCurrentTier = () => {
    return pointsTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || pointsTiers[0];
  };

  const getNextTier = () => {
    return pointsTiers.find(tier => tier.minPoints > points);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  if (!buyer) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <FaCoins className="text-2xl" />
          <h3 className="text-xl font-bold">BF Points Program</h3>
        </div>
        <p className="mb-4">Join our loyalty program and earn points on every purchase!</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold">Earn Points:</div>
            <ul className="mt-1 space-y-1">
              <li>• Car purchases: 500-2000 pts</li>
              <li>• Referrals: 200 pts</li>
              <li>• Reviews: 50 pts</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Redeem For:</div>
            <ul className="mt-1 space-y-1">
              <li>• Discounts</li>
              <li>• Free services</li>
              <li>• VIP benefits</li>
            </ul>
          </div>
        </div>
        <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors">
          Sign Up Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaCoins className="text-3xl" />
            <div>
              <h3 className="text-xl font-bold">BF Points Balance</h3>
              <p className="text-blue-100">Current Tier: {currentTier.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{points.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Points</div>
          </div>
        </div>

        {nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to {nextTier.name}</span>
              <span>{points}/{nextTier.minPoints} pts</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((points / nextTier.minPoints) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1">Tier Benefits:</div>
            <ul className="space-y-1">
              {currentTier.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="flex items-center gap-1">
                  <FaStar className="text-yellow-300 text-xs" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowRewardsModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
            >
              Redeem Points
            </button>
          </div>
        </div>
      </div>

      {/* Earn Points Section */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaGift className="text-green-600" />
          Ways to Earn Points
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnPointsActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 transition-colors">
              <div className="text-green-600 text-xl">{activity.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{activity.activity}</div>
                <div className="text-sm text-green-600 font-semibold">{activity.points}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {pointsHistory.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {item.type === 'earn' ? '+' : '-'}
                </div>
                <div>
                  <div className="font-medium">{item.action}</div>
                  <div className="text-sm text-gray-500">{item.date}</div>
                </div>
              </div>
              <div className={`font-semibold ${
                item.type === 'earn' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.type === 'earn' ? '+' : ''}{item.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Redeem Your Points</h3>
                <button
                  onClick={() => setShowRewardsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{reward.image}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{reward.name}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <FaCoins className="text-yellow-500" />
                        <span className="font-semibold text-yellow-600">{reward.points} points</span>
                      </div>
                      <button
                        disabled={points < reward.points}
                        className={`px-4 py-2 rounded font-semibold transition-colors ${
                          points >= reward.points
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BFPointsSystem;