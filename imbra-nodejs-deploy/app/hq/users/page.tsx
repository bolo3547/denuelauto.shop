'use client';

import React, { useEffect, useState } from 'react';
import {
  FaUsers, FaPlus, FaEdit, FaTrash, FaShieldAlt, FaEnvelope,
  FaCheck, FaBan, FaSearch, FaUserShield, FaUserCog, FaDollarSign, FaHeadset
} from 'react-icons/fa';

interface HqUser {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'FINANCE';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export default function HqUsersPage() {
  const [users, setUsers] = useState<HqUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<HqUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'SUPPORT' as HqUser['role'],
    password: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(r => setTimeout(r, 500));
      setUsers([
        { id: '1', email: 'admin@denuel.com', fullName: 'System Admin', role: 'SUPER_ADMIN', status: 'active', lastLogin: '5 min ago', createdAt: '2024-01-01' },
        { id: '2', email: 'support@denuel.com', fullName: 'Support Team', role: 'SUPPORT', status: 'active', lastLogin: '2 hours ago', createdAt: '2024-03-15' },
        { id: '3', email: 'finance@denuel.com', fullName: 'Finance Team', role: 'FINANCE', status: 'active', lastLogin: '1 day ago', createdAt: '2024-06-01' },
        { id: '4', email: 'backup@denuel.com', fullName: 'Backup Admin', role: 'SUPER_ADMIN', status: 'inactive', lastLogin: '2 weeks ago', createdAt: '2024-02-10' },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: HqUser['role']) => {
    const config = {
      SUPER_ADMIN: { icon: FaUserShield, color: 'bg-purple-100 text-purple-700', label: 'Super Admin' },
      SUPPORT: { icon: FaHeadset, color: 'bg-blue-100 text-blue-700', label: 'Support' },
      FINANCE: { icon: FaDollarSign, color: 'bg-green-100 text-green-700', label: 'Finance' },
    };
    const { icon: Icon, color, label } = config[role];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${color}`}>
        <Icon />
        {label}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: HqUser = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', fullName: '', role: 'SUPPORT', password: '' });
  };

  const handleEdit = (user: HqUser) => {
    setEditingUser(user);
    setFormData({ email: user.email, fullName: user.fullName, role: user.role, password: '' });
    setShowModal(true);
  };

  const toggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const handleDelete = (userId: string) => {
    if (confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HQ Users</h1>
          <p className="text-gray-600">Manage platform administrators and staff</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setFormData({ email: '', fullName: '', role: 'SUPPORT', password: '' }); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Super Admins</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'SUPER_ADMIN').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Support Staff</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'SUPPORT').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Finance Staff</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'FINANCE').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Login</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{user.lastLogin}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{user.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => toggleStatus(user.id)} className={`p-2 rounded ${user.status === 'active' ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                      {user.status === 'active' ? <FaBan /> : <FaCheck />}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as HqUser['role'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                  title="Select role"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="SUPPORT">Support</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingUser}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
