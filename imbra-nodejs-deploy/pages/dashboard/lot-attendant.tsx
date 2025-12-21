import React from 'react';

export default function LotAttendantDashboard() {
  // TODO: Fetch lot attendant KPIs, tasks, and messages
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lot Attendant Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Cars Moved Today: <span className="font-bold">12</span></div>
      {/* Tasks */}
      <div className="mb-6">Today's Tasks: <ul><li>Move cars to display</li><li>Clean lot</li></ul></div>
      {/* Chat */}
      <div className="mb-6">Internal Chat (mock): <ul><li>Jane: "Car #22 needs moving."</li><li>John: "On my way."</li></ul></div>
      {/* TODO: Add real chat component */}
    </div>
  );
}
