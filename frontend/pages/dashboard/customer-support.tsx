import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function CustomerSupportDashboard() {
  const [kpis, setKpis] = React.useState({ openTickets: 5 });
  React.useEffect(() => {
    fetch('/api/dashboard/customer-support/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Support Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Open Tickets: <span className="font-bold">{kpis.openTickets}</span></div>
      {/* Tasks */}
      <div className="mb-6">Today&apos;s Tasks: <ul><li>Reply to tickets</li><li>Call back customers</li></ul></div>
      {/* Chat */}
      <BackOfficeChat currentUserId="customer_support" />
    </div>
  );
}
