import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function SalesRepDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Representative Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Cars Sold Today</h3>
          <p className="text-2xl font-bold text-blue-600">2</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Leads Contacted</h3>
          <p className="text-2xl font-bold text-green-600">15</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Appointments</h3>
          <p className="text-2xl font-bold text-purple-600">5</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Commission Earned</h3>
          <p className="text-2xl font-bold text-orange-600">ZMW 5,000</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Follow up with leads</li>
          <li>Show cars to customers</li>
          <li>Update CRM</li>
          <li>Prepare quotes</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="sales_rep" />
      </div>
    </div>
  );
}