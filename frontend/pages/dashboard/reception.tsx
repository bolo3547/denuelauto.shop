import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function ReceptionDashboard() {
  const [kpis, setKpis] = React.useState({ visitorsToday: 15 });
  React.useEffect(() => {
    fetch('/api/dashboard/reception/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reception Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Visitors Today: <span className="font-bold">{kpis.visitorsToday}</span></div>
      {/* Tasks */}
      <div className="mb-6">Today&apos;s Tasks: <ul><li>Greet visitors</li><li>Answer phone calls</li></ul></div>
      {/* Chat */}
      <BackOfficeChat currentUserId="reception" />
    </div>
  );
}
