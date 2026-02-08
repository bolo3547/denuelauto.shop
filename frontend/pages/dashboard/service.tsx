import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function ServiceDashboard() {
  const [kpis, setKpis] = React.useState({ carsServiced: 8, avgServiceTime: 2.5, partsUsed: 45, customerSatisfaction: 92 });
  React.useEffect(() => {
    fetch('/api/dashboard/service/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Service Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPIs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Cars Serviced Today</h3>
          <p className="text-2xl font-bold text-blue-600">{kpis.carsServiced}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Average Service Time</h3>
          <p className="text-2xl font-bold text-green-600">{kpis.avgServiceTime} hrs</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Parts Used</h3>
          <p className="text-2xl font-bold text-purple-600">{kpis.partsUsed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Customer Satisfaction</h3>
          <p className="text-2xl font-bold text-orange-600">{kpis.customerSatisfaction}%</p>
        </div>
      </div>
      {/* Tasks */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Check service bay</li>
          <li>Update job status</li>
          <li>Order parts</li>
          <li>Review technician performance</li>
        </ul>
      </div>
      {/* Chat */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="service_mgr" />
      </div>
    </div>
  );
}
