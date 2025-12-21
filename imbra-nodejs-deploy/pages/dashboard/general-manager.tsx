import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function GeneralManagerDashboard() {
  // TODO: Fetch KPIs, tasks, and messages
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">General Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPIs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Staff</h3>
          <p className="text-2xl font-bold text-blue-600">48</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">ZMW 2,500,000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Cars Sold</h3>
          <p className="text-2xl font-bold text-purple-600">120</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Service Jobs</h3>
          <p className="text-2xl font-bold text-orange-600">85</p>
        </div>
      </div>
      {/* Tasks */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Review department reports</li>
          <li>Meet with sales manager</li>
          <li>Approve budget for marketing</li>
          <li>Check IT system updates</li>
        </ul>
      </div>
      {/* Chat */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="gm" />
      </div>
    </div>
  );
}
