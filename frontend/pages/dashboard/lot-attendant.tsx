import React from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';

export default function LotAttendantDashboard() {
  const [kpis, setKpis] = React.useState({ carsMovedToday: 12 });
  React.useEffect(() => {
    fetch('/api/dashboard/lot-attendant/kpis').then(r => r.ok ? r.json() : null).then(data => { if (data) setKpis(data); }).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lot Attendant Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Cars Moved Today: <span className="font-bold">{kpis.carsMovedToday}</span></div>
      {/* Tasks */}
      <div className="mb-6">Today&apos;s Tasks: <ul><li>Move cars to display</li><li>Clean lot</li></ul></div>
      {/* Chat */}
      <BackOfficeChat currentUserId="lot_attendant" />
    </div>
  );
}
