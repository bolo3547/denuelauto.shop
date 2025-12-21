import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'on-leave' | 'terminated';
  joinDate: string;
  salary: number;
  avatar?: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export default function HRPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setEmployees([
      { id: '1', name: 'John Manager', email: 'john@dealer.com', department: 'Sales', position: 'Sales Manager', status: 'active', joinDate: '2022-03-15', salary: 5500 },
      { id: '2', name: 'Sarah Sales', email: 'sarah@dealer.com', department: 'Sales', position: 'Sales Rep', status: 'active', joinDate: '2023-01-10', salary: 3500 },
      { id: '3', name: 'Mike Tech', email: 'mike@dealer.com', department: 'IT', position: 'IT Support', status: 'active', joinDate: '2023-06-01', salary: 4000 },
      { id: '4', name: 'Lisa Marketing', email: 'lisa@dealer.com', department: 'Marketing', position: 'Marketing Lead', status: 'on-leave', joinDate: '2022-08-20', salary: 4500 },
      { id: '5', name: 'Tom Finance', email: 'tom@dealer.com', department: 'Finance', position: 'Accountant', status: 'active', joinDate: '2021-11-05', salary: 5000 },
    ]);

    setLeaveRequests([
      { id: '1', employee: 'Lisa Marketing', type: 'Annual Leave', startDate: '2024-12-20', endDate: '2024-12-27', status: 'approved', reason: 'Family vacation' },
      { id: '2', employee: 'Sarah Sales', type: 'Sick Leave', startDate: '2024-12-10', endDate: '2024-12-11', status: 'pending', reason: 'Medical appointment' },
      { id: '3', employee: 'Mike Tech', type: 'Personal', startDate: '2024-12-15', endDate: '2024-12-15', status: 'pending', reason: 'Personal matters' },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'leave', label: 'Leave Management', icon: '🏖️' },
    { id: 'performance', label: 'Performance', icon: '⭐' },
    { id: 'recruitment', label: 'Recruitment', icon: '📝' },
    { id: 'training', label: 'Training', icon: '📚' },
  ];

  return (
    <>
      <Head>
        <title>HR Department | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  ← Back
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">HR Department</h1>
                  <p className="text-slate-400 text-xs">Staff Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
              >
                + Add Employee
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👥</span>
                    <span className="text-slate-400 text-sm">Total Employees</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{employees.length}</p>
                  <p className="text-green-400 text-xs mt-1">{employees.filter(e => e.status === 'active').length} active</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏖️</span>
                    <span className="text-slate-400 text-sm">On Leave</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{employees.filter(e => e.status === 'on-leave').length}</p>
                  <p className="text-yellow-400 text-xs mt-1">{leaveRequests.filter(l => l.status === 'pending').length} pending requests</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📝</span>
                    <span className="text-slate-400 text-sm">Open Positions</span>
                  </div>
                  <p className="text-white text-2xl font-bold">3</p>
                  <p className="text-blue-400 text-xs mt-1">12 applicants</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-slate-400 text-sm">Monthly Payroll</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0))}</p>
                  <p className="text-slate-400 text-xs mt-1">Next: Dec 25</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Department Distribution</h3>
                  <div className="space-y-3">
                    {['Sales', 'IT', 'Marketing', 'Finance'].map((dept) => {
                      const count = employees.filter(e => e.department === dept).length;
                      const percentage = (count / employees.length) * 100;
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{dept}</span>
                            <span className="text-slate-400">{count} employees</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Recent Leave Requests</h3>
                  <div className="space-y-3">
                    {leaveRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{request.employee}</p>
                          <p className="text-slate-400 text-xs">{request.type} • {request.startDate}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold">All Employees</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option>All Departments</option>
                    <option>Sales</option>
                    <option>IT</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Employee</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Department</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Position</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Join Date</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                    <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-medium">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{emp.name}</p>
                            <p className="text-slate-400 text-xs">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{emp.department}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{emp.position}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{emp.joinDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          emp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          emp.status === 'on-leave' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                          <button className="text-slate-400 hover:text-white text-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Today&apos;s Attendance</h3>
                  <span className="text-slate-400 text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-3xl font-bold">4</p>
                    <p className="text-slate-400 text-sm">Present</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-3xl font-bold">1</p>
                    <p className="text-slate-400 text-sm">On Leave</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-3xl font-bold">0</p>
                    <p className="text-slate-400 text-sm">Absent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${emp.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-white">{emp.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">{emp.status === 'active' ? '08:30 AM' : 'On Leave'}</span>
                        <span className={`px-2 py-1 text-xs rounded ${emp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {emp.status === 'active' ? 'Present' : 'Leave'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leave Management Tab */}
          {activeTab === 'leave' && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-bold">Leave Requests</h3>
              </div>
              <div className="p-4 space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{request.employee}</p>
                        <p className="text-slate-400 text-sm">{request.type}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">
                      <p>📅 {request.startDate} to {request.endDate}</p>
                      <p>📝 {request.reason}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Approve</button>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-bold mb-4">Performance Reviews</h3>
              <div className="space-y-4">
                {employees.filter(e => e.status === 'active').map((emp) => (
                  <div key={emp.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{emp.name}</p>
                          <p className="text-slate-400 text-xs">{emp.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className={star <= 4 ? 'text-yellow-400' : 'text-slate-600'}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">Tasks: 95%</span>
                      <span className="text-blue-400">Attendance: 98%</span>
                      <span className="text-purple-400">Goals: 4/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruitment Tab */}
          {activeTab === 'recruitment' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Open Positions</h3>
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">
                    + Post Job
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Sales Representative', department: 'Sales', applicants: 5, posted: '5 days ago' },
                    { title: 'Marketing Specialist', department: 'Marketing', applicants: 4, posted: '1 week ago' },
                    { title: 'Finance Assistant', department: 'Finance', applicants: 3, posted: '2 weeks ago' },
                  ].map((job, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{job.title}</p>
                        <p className="text-slate-400 text-xs">{job.department} • Posted {job.posted}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {job.applicants} applicants
                        </span>
                        <button className="text-amber-400 hover:text-amber-300 text-sm">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Training Programs</h3>
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">
                  + Add Training
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Sales Techniques 101', type: 'Online', duration: '4 hours', enrolled: 3, status: 'Active' },
                  { name: 'Customer Service Excellence', type: 'In-person', duration: '2 days', enrolled: 5, status: 'Upcoming' },
                  { name: 'Product Knowledge', type: 'Online', duration: '3 hours', enrolled: 4, status: 'Completed' },
                ].map((training, idx) => (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{training.name}</p>
                      <span className={`px-2 py-1 text-xs rounded ${
                        training.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        training.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-600 text-slate-400'
                      }`}>
                        {training.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>📚 {training.type}</span>
                      <span>⏱️ {training.duration}</span>
                      <span>👥 {training.enrolled} enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
