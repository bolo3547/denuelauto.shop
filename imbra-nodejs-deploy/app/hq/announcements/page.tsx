'use client';

import React, { useEffect, useState } from 'react';
import {
  FaBell, FaPlus, FaEdit, FaTrash, FaEye, FaPaperPlane, FaTimes,
  FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaBullhorn
} from 'react-icons/fa';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  status: 'draft' | 'published' | 'scheduled';
  targetAudience: 'all' | 'enterprise' | 'professional' | 'starter';
  publishedAt?: string;
  scheduledFor?: string;
  createdBy: string;
  viewCount: number;
}

export default function HqAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as Announcement['type'],
    targetAudience: 'all' as Announcement['targetAudience'],
    status: 'draft' as Announcement['status'],
    scheduledFor: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(r => setTimeout(r, 500));
      setAnnouncements([
        { id: '1', title: 'Platform Maintenance - Dec 15', content: 'We will be performing scheduled maintenance on December 15th from 2:00 AM to 4:00 AM. The platform may be unavailable during this time.', type: 'warning', status: 'published', targetAudience: 'all', publishedAt: '2024-12-10', createdBy: 'admin@denuel.com', viewCount: 42 },
        { id: '2', title: 'New Feature: Bulk Vehicle Import', content: 'You can now import vehicles in bulk using CSV files. Go to Inventory > Import to try it out!', type: 'success', status: 'published', targetAudience: 'all', publishedAt: '2024-12-08', createdBy: 'admin@denuel.com', viewCount: 38 },
        { id: '3', title: 'Holiday Support Hours', content: 'During the holiday season (Dec 23 - Jan 2), our support hours will be 9 AM - 3 PM. Emergency support available 24/7.', type: 'info', status: 'scheduled', targetAudience: 'all', scheduledFor: '2024-12-20', createdBy: 'support@denuel.com', viewCount: 0 },
        { id: '4', title: 'Enterprise API Updates', content: 'New API endpoints are now available for enterprise customers. Check the documentation for details.', type: 'info', status: 'published', targetAudience: 'enterprise', publishedAt: '2024-12-05', createdBy: 'admin@denuel.com', viewCount: 12 },
        { id: '5', title: 'Urgent: Security Update Required', content: 'Please ensure all users update their passwords by December 20th as part of our security enhancement.', type: 'critical', status: 'draft', targetAudience: 'all', createdBy: 'admin@denuel.com', viewCount: 0 },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getTypeBadge = (type: Announcement['type']) => {
    const config = {
      info: { icon: FaInfoCircle, color: 'bg-blue-100 text-blue-700' },
      warning: { icon: FaExclamationCircle, color: 'bg-yellow-100 text-yellow-700' },
      success: { icon: FaCheckCircle, color: 'bg-green-100 text-green-700' },
      critical: { icon: FaExclamationCircle, color: 'bg-red-100 text-red-700' },
    };
    const { icon: Icon, color } = config[type];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${color}`}>
        <Icon />
        {type}
      </span>
    );
  };

  const getStatusBadge = (status: Announcement['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>{status}</span>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? { ...a, ...formData } : a));
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        createdBy: 'admin@denuel.com',
        viewCount: 0,
        publishedAt: formData.status === 'published' ? new Date().toISOString().split('T')[0] : undefined,
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', type: 'info', targetAudience: 'all', status: 'draft', scheduledFor: '' });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetAudience: announcement.targetAudience,
      status: announcement.status,
      scheduledFor: announcement.scheduledFor || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handlePublish = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, status: 'published', publishedAt: new Date().toISOString().split('T')[0] } : a
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Broadcast messages to all tenants</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{announcements.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{announcements.filter(a => a.status === 'published').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{announcements.filter(a => a.status === 'scheduled').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{announcements.filter(a => a.status === 'draft').length}</p>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="divide-y">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(announcement.type)}
                    {getStatusBadge(announcement.status)}
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                      {announcement.targetAudience === 'all' ? 'All Tenants' : announcement.targetAudience}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>By {announcement.createdBy}</span>
                    {announcement.publishedAt && <span>Published: {announcement.publishedAt}</span>}
                    {announcement.scheduledFor && <span>Scheduled: {announcement.scheduledFor}</span>}
                    {announcement.status === 'published' && (
                      <span className="flex items-center gap-1">
                        <FaEye /> {announcement.viewCount} views
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {announcement.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(announcement.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <FaPaperPlane /> Publish
                    </button>
                  )}
                  <button onClick={() => handleEdit(announcement)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(announcement.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={5}
                  required
                  placeholder="Announcement content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                    className="w-full px-3 py-2 border rounded-lg"
                    title="Select type"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Announcement['targetAudience'] })}
                    className="w-full px-3 py-2 border rounded-lg"
                    title="Select target audience"
                  >
                    <option value="all">All Tenants</option>
                    <option value="enterprise">Enterprise Only</option>
                    <option value="professional">Professional Only</option>
                    <option value="starter">Starter Only</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Announcement['status'] })}
                    className="w-full px-3 py-2 border rounded-lg"
                    title="Select status"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Publish Now</option>
                    <option value="scheduled">Schedule</option>
                  </select>
                </div>
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For</label>
                    <input
                      type="date"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <FaBullhorn />
                  {editingAnnouncement ? 'Update' : formData.status === 'published' ? 'Publish' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
