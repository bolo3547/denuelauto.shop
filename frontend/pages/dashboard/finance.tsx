import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function FinanceDashboard() {
  const [kpis, setKpis] = React.useState({ totalRevenue: 1200000 });
  React.useEffect(() => {
    fetch('/api/dashboard/finance/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Total Revenue: <span className="font-bold">ZMW {kpis.totalRevenue.toLocaleString()}</span></div>
      {/* Tasks */}
      <div className="mb-6">Today&apos;s Tasks: <ul><li>Review payments</li><li>Approve invoices</li></ul></div>
      {/* Chat */}
      <BackOfficeChat currentUserId="finance_mgr" />
    </div>
  );
}
