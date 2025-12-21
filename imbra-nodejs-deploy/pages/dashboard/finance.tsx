import React from 'react';

export default function FinanceDashboard() {
  // TODO: Fetch finance KPIs, tasks, and messages
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Total Revenue: <span className="font-bold">ZMW 1,200,000</span></div>
      {/* Tasks */}
      <div className="mb-6">Today's Tasks: <ul><li>Review payments</li><li>Approve invoices</li></ul></div>
      {/* Chat */}
      <div className="mb-6">Internal Chat (mock): <ul><li>Jane: "Invoice #123 paid."</li><li>John: "Confirmed."</li></ul></div>
      {/* TODO: Add real chat component */}
    </div>
  );
}
