import React, { useEffect, useState } from 'react';
import BackOfficeChat from '../../components/BackOfficeChat';
import EditStaffModal from '../../components/EditStaffModal';
import { makeApiUrl } from '@/lib/config/api';

export default function HRManagerDashboard() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', role: 'SALES_REP', department: 'Sales', email: '', phone: '' });
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchStaff = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(makeApiUrl('/api/staff'));
      const data = await res.json();
      setStaff(data);
    } catch (e: any) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const addStaff = async () => {
    if (!form.fullName.trim()) return;
    try {
      const res = await fetch(makeApiUrl('/api/staff'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed');
      await fetchStaff();
      setForm({ fullName: '', role: 'SALES_REP', department: 'Sales', email: '', phone: '' });
    } catch (e) {
      alert('Failed to add staff');
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleSaveStaff = async (updatedStaff: any) => {
    try {
      const res = await fetch(makeApiUrl('/api/staff'), { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(updatedStaff) 
      });
      if (!res.ok) throw new Error('Failed');
      await fetchStaff();
    } catch (e) {
      alert('Failed to update staff');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await fetch(makeApiUrl(`/api/staff?id=${id}`), { method: 'DELETE' });
      await fetchStaff();
    } catch (e) {
      alert('Failed to delete staff');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">HR Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPIs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Staff</h3>
          <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">New Hires This Month</h3>
          <p className="text-2xl font-bold text-green-600">3</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Turnover Rate</h3>
          <p className="text-2xl font-bold text-purple-600">5%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Training Completed</h3>
          <p className="text-2xl font-bold text-orange-600">12</p>
        </div>
      </div>
      {/* Staff Management */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="Full Name" className="border rounded px-3 py-2" />
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="border rounded px-3 py-2">
            <option value="SALES_REP">Sales Rep</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="SERVICE_MANAGER">Service Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="MARKETING_MANAGER">Marketing Manager</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="IT_MANAGER">IT Manager</option>
          </select>
          <input value={form.department} onChange={e=>setForm({...form, department:e.target.value})} placeholder="Department" className="border rounded px-3 py-2" />
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="border rounded px-3 py-2" />
          <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="border rounded px-3 py-2" />
          <button onClick={addStaff} className="bg-blue-600 text-white px-4 py-2 rounded">Add New Staff</button>
        </div>
        {loading && <div className="text-sm text-gray-500">Loading staff…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.fullName}</td>
                <td className="px-4 py-2">{s.role}</td>
                <td className="px-4 py-2">{s.department}</td>
                <td className="px-4 py-2">
                  <button 
                    className="text-blue-600 mr-3 hover:text-blue-800" 
                    onClick={() => handleEditStaff(s)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800" 
                    onClick={() => handleDeleteStaff(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditStaffModal
        staff={editingStaff}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
      />
      {/* Chat */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Internal Chat</h2>
        <BackOfficeChat currentUserId="hr_mgr" />
      </div>
    </div>
  );
}