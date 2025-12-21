import React from 'react';

export default function CustomerSupportDashboard() {
  // TODO: Fetch support KPIs, tasks, and messages
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Support Dashboard</h1>
      {/* KPIs */}
      <div className="mb-6">Open Tickets: <span className="font-bold">5</span></div>
      {/* Tasks */}
      <div className="mb-6">Today's Tasks: <ul><li>Reply to tickets</li><li>Call back customers</li></ul></div>
      {/* Chat */}
      <div className="mb-6">Internal Chat (mock): <ul><li>Jane: "Ticket #45 resolved."</li><li>John: "Good job!"</li></ul></div>
      {/* TODO: Add real chat component */}
    </div>
  );
}
