import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function FinanceManagerDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Finance Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">ZMW 1,200,000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Expenses</h3>
          <p className="text-2xl font-bold text-green-600">ZMW 800,000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Profit Margin</h3>
          <p className="text-2xl font-bold text-purple-600">33%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Outstanding Invoices</h3>
          <p className="text-2xl font-bold text-orange-600">5</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Review payments</li>
          <li>Approve invoices</li>
          <li>Update budgets</li>
          <li>Prepare financial reports</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="finance_mgr" />
      </div>
    </div>
  );
}