import React from 'react';

export default function SecurityDashboard() {
  // TODO: Fetch security KPIs, tasks, and messages
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Security Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Incidents Today: <span className="font-bold">0</span></div>
      {/* Tasks */}
      <div className="mb-6">Today's Tasks: <ul><li>Patrol lot</li><li>Check cameras</li></ul></div>
      {/* Chat */}
      <div className="mb-6">Internal Chat (mock): <ul><li>Jane: "All clear."</li><li>John: "Thanks."</li></ul></div>
      {/* TODO: Add real chat component */}
    </div>
  );
}
