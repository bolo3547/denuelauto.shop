import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function SecurityDashboard() {
  const [kpis, setKpis] = React.useState({ incidentsToday: 0 });
  React.useEffect(() => {
    fetch('/api/dashboard/security/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Security Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Incidents Today: <span className="font-bold">{kpis.incidentsToday}</span></div>
      {/* Tasks */}
      <div className="mb-6">Today&apos;s Tasks: <ul><li>Patrol lot</li><li>Check cameras</li></ul></div>
      {/* Chat */}
      <BackOfficeChat currentUserId="security" />
    </div>
  );
}
