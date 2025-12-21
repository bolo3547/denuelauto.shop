import React from 'react';

export default function BuyerDashboardStats() {
  // Mock stats, replace with real API calls
  const stats = {
    inTransit: 2,
    delivered: 5,
    pendingPayment: 1,
    notifications: 3,
  };
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-blue-50 p-6 rounded shadow text-center">
        <div className="text-2xl font-bold text-blue-700">{stats.inTransit}</div>
        <div className="text-sm text-gray-600 mt-2">In Transit</div>
      </div>
      <div className="bg-green-50 p-6 rounded shadow text-center">
        <div className="text-2xl font-bold text-green-700">{stats.delivered}</div>
        <div className="text-sm text-gray-600 mt-2">Delivered</div>
      </div>
      <div className="bg-yellow-50 p-6 rounded shadow text-center">
        <div className="text-2xl font-bold text-yellow-700">{stats.pendingPayment}</div>
        <div className="text-sm text-gray-600 mt-2">Pending Payment</div>
      </div>
      <div className="bg-purple-50 p-6 rounded shadow text-center">
        <div className="text-2xl font-bold text-purple-700">{stats.notifications}</div>
        <div className="text-sm text-gray-600 mt-2">Notifications</div>
      </div>
    </section>
  );
}
