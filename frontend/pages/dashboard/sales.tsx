import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function SalesDashboard() {
  const [kpis, setKpis] = React.useState({ carsSold: 42, avgDealSize: 150000, leadsConverted: 15, teamPerformance: 85 });
  React.useEffect(() => {
    fetch('/api/dashboard/sales/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPIs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Cars Sold This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{kpis.carsSold}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Average Deal Size</h3>
          <p className="text-2xl font-bold text-green-600">ZMW {kpis.avgDealSize.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Leads Converted</h3>
          <p className="text-2xl font-bold text-purple-600">{kpis.leadsConverted}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Team Performance</h3>
          <p className="text-2xl font-bold text-orange-600">{kpis.teamPerformance}%</p>
        </div>
      </div>
      {/* Tasks */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Follow up with leads</li>
          <li>Update car listings</li>
          <li>Coach sales reps</li>
          <li>Review sales targets</li>
        </ul>
      </div>
      {/* Chat */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="sales_mgr" />
      </div>
    </div>
  );
}
