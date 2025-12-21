import React from 'react';

export default function ReceptionDashboard() {
  // TODO: Fetch reception KPIs, tasks, and messages
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reception Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Visitors Today: <span className="font-bold">15</span></div>
      {/* Tasks */}
      <div className="mb-6">Today's Tasks: <ul><li>Greet visitors</li><li>Answer phone calls</li></ul></div>
      {/* Chat */}
      <div className="mb-6">Internal Chat (mock): <ul><li>Jane: "Visitor for John."</li><li>John: "Send to office."</li></ul></div>
      {/* TODO: Add real chat component */}
    </div>
  );
}
