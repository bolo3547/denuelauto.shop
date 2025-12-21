'use client';

import React, { useState, useEffect } from 'react';
import {
  PortalDashboard,
  CustomerPortalSection,
  PORTAL_NAVIGATION,
} from '@/lib/portal/customer-portal';

interface CustomerPortalDashboardProps {
  tenantSlug: string;
  initialData?: PortalDashboard;
}

export default function CustomerPortalDashboard({
  tenantSlug,
  initialData,
}: CustomerPortalDashboardProps) {
  const [activeSection, setActiveSection] = useState<CustomerPortalSection>('dashboard');
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchDashboard();
    }
  }, [tenantSlug]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/t/${tenantSlug}/portal/dashboard`);
      const data = await response.json();
      setDashboard(data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Unable to load dashboard</p>
      </div>
    );
  }

  const { customer, summary, recentActivity, upcomingPayments, notifications } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-semibold">Welcome back, {customer.name}</h1>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <span className="text-xl">🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
              {PORTAL_NAVIGATION.map((item) => (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.section
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && summary && (
                    <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {item.badge === 'orders' && summary.activeOrders}
                      {item.badge === 'payments' && summary.pendingPayments}
                      {item.badge === 'tickets' && summary.openTickets}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SummaryCard
                    title="Total Orders"
                    value={summary.totalOrders}
                    icon="📦"
                    color="blue"
                  />
                  <SummaryCard
                    title="Total Spent"
                    value={`${summary.currency} ${summary.totalSpent.toLocaleString()}`}
                    icon="💰"
                    color="green"
                  />
                  <SummaryCard
                    title="Vehicles Owned"
                    value={summary.vehiclesOwned}
                    icon="🚗"
                    color="purple"
                  />
                  <SummaryCard
                    title="Active Reservations"
                    value={summary.activeReservations}
                    icon="🔒"
                    color="orange"
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                            <span className="text-2xl">
                              {activity.type === 'order' && '📦'}
                              {activity.type === 'payment' && '💳'}
                              {activity.type === 'reservation' && '🔒'}
                              {activity.type === 'ticket' && '💬'}
                              {activity.type === 'favorite' && '❤️'}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Payments */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Upcoming Payments</h2>
                    <div className="space-y-4">
                      {upcomingPayments.length > 0 ? (
                        upcomingPayments.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{payment.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {payment.currency} {payment.amount.toLocaleString()}
                              </p>
                              <button className="text-sm text-blue-600 hover:text-blue-800">
                                Pay Now
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No upcoming payments</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton icon="🚗" label="Browse Vehicles" />
                    <QuickActionButton icon="📅" label="Schedule Test Drive" />
                    <QuickActionButton icon="💬" label="Contact Support" />
                    <QuickActionButton icon="📄" label="Download Documents" />
                  </div>
                </div>

                {/* Verification Status */}
                {(!customer.verification.email || !customer.verification.phone) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800">Complete Your Profile</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Verify your account to unlock all features
                    </p>
                    <div className="flex gap-3 mt-3">
                      {!customer.verification.email && (
                        <button className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                          Verify Email
                        </button>
                      )}
                      {!customer.verification.phone && (
                        <button className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                          Verify Phone
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'orders' && (
              <OrdersSection tenantSlug={tenantSlug} />
            )}

            {activeSection === 'payments' && (
              <PaymentsSection tenantSlug={tenantSlug} />
            )}

            {activeSection === 'vehicles' && (
              <VehiclesSection tenantSlug={tenantSlug} />
            )}

            {activeSection === 'support' && (
              <SupportSection tenantSlug={tenantSlug} />
            )}

            {activeSection === 'profile' && (
              <ProfileSection customer={customer} />
            )}

            {activeSection === 'settings' && (
              <SettingsSection customer={customer} />
            )}

            {/* Placeholder for other sections */}
            {['reservations', 'favorites', 'documents'].includes(activeSection) && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <span className="text-4xl">
                  {PORTAL_NAVIGATION.find(n => n.section === activeSection)?.icon}
                </span>
                <h2 className="text-xl font-semibold mt-4">
                  {PORTAL_NAVIGATION.find(n => n.section === activeSection)?.label}
                </h2>
                <p className="text-gray-500 mt-2">Coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// Orders Section
function OrdersSection({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">My Orders</h2>
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">📦</span>
        <p className="mt-2">No orders yet</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Browse Vehicles
        </button>
      </div>
    </div>
  );
}

// Payments Section
function PaymentsSection({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Payment History</h2>
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">💳</span>
        <p className="mt-2">No payments yet</p>
      </div>
    </div>
  );
}

// Vehicles Section
function VehiclesSection({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">My Vehicles</h2>
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">🚗</span>
        <p className="mt-2">No vehicles yet</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Browse Inventory
        </button>
      </div>
    </div>
  );
}

// Support Section
function SupportSection({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Support Tickets</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          New Ticket
        </button>
      </div>
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">💬</span>
        <p className="mt-2">No support tickets</p>
      </div>
    </div>
  );
}

// Profile Section
function ProfileSection({ customer }: { customer: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">My Profile</h2>
      <div className="max-w-lg space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {customer.name.charAt(0)}
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Change Photo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              defaultValue={customer.name}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              defaultValue={customer.email}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              defaultValue={customer.phone || ''}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection({ customer }: { customer: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              defaultChecked={customer.preferences.notifications.email}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>SMS Notifications</span>
            <input
              type="checkbox"
              defaultChecked={customer.preferences.notifications.sms}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Push Notifications</span>
            <input
              type="checkbox"
              defaultChecked={customer.preferences.notifications.push}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span>Change Password</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span>Two-Factor Authentication</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span>Login History</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
        <button className="text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
          Delete Account
        </button>
      </div>
    </div>
  );
}
