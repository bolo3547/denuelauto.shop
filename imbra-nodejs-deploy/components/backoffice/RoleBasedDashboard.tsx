"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCar, FaUsers, FaDollarSign, FaChartLine, FaInbox,
  FaClipboardList, FaCog, FaFileInvoice, FaUserTie,
  FaCalculator, FaMoneyBillWave, FaReceipt, FaUserCog,
  FaHistory, FaServer, FaToggleOn, FaBell, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaArrowUp, FaArrowDown, FaEye,
  FaPhoneAlt, FaWhatsapp, FaEnvelope, FaCalendarAlt,
  FaPlusCircle, FaSearch, FaFilter
} from 'react-icons/fa';

// Types
type UserRole = 'admin' | 'sales_agent' | 'accountant' | 'hr' | 'it_manager' | 'cashier';

interface DashboardStats {
  totalStock: number;
  availableCars: number;
  reservedCars: number;
  soldCars: number;
  totalInquiries: number;
  newInquiriesThisWeek: number;
  totalSales: number;
  salesThisMonth: number;
  revenue: number;
  pendingPayments: number;
  totalStaff: number;
  conversionRate: number;
}

interface RoleBasedDashboardProps {
  tenantSlug: string;
  userRole: UserRole;
  userName: string;
  stats?: DashboardStats;
}

// Sample data for demonstration
const DEFAULT_STATS: DashboardStats = {
  totalStock: 156,
  availableCars: 98,
  reservedCars: 24,
  soldCars: 34,
  totalInquiries: 287,
  newInquiriesThisWeek: 43,
  totalSales: 34,
  salesThisMonth: 12,
  revenue: 485000,
  pendingPayments: 125000,
  totalStaff: 15,
  conversionRate: 11.8,
};

export default function RoleBasedDashboard({
  tenantSlug,
  userRole,
  userName,
  stats = DEFAULT_STATS,
}: RoleBasedDashboardProps) {
  const [currency, setCurrency] = useState('ZMW');

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);
  }, [tenantSlug]);

  const formatMoney = (amount: number) => {
    if (currency === 'ZMW') {
      return `K${amount.toLocaleString()}`;
    }
    return `$${Math.round(amount / 27).toLocaleString()}`;
  };

  // Render different dashboards based on role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard tenantSlug={tenantSlug} stats={stats} formatMoney={formatMoney} userName={userName} />;
    case 'sales_agent':
      return <SalesAgentDashboard tenantSlug={tenantSlug} stats={stats} formatMoney={formatMoney} userName={userName} />;
    case 'accountant':
      return <AccountantDashboard tenantSlug={tenantSlug} stats={stats} formatMoney={formatMoney} userName={userName} />;
    case 'hr':
      return <HRDashboard tenantSlug={tenantSlug} stats={stats} userName={userName} />;
    case 'it_manager':
      return <ITManagerDashboard tenantSlug={tenantSlug} userName={userName} />;
    case 'cashier':
      return <CashierDashboard tenantSlug={tenantSlug} stats={stats} formatMoney={formatMoney} userName={userName} />;
    default:
      return <AdminDashboard tenantSlug={tenantSlug} stats={stats} formatMoney={formatMoney} userName={userName} />;
  }
}

// ============================================
// ADMIN DASHBOARD (Full Access)
// ============================================
function AdminDashboard({ tenantSlug, stats, formatMoney, userName }: {
  tenantSlug: string;
  stats: DashboardStats;
  formatMoney: (amount: number) => string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-blue-100 mt-1">Here's what's happening with your dealership today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock"
          value={stats.totalStock}
          icon={FaCar}
          color="blue"
          change={+5}
          link={`/t/${tenantSlug}/admin/inventory`}
        />
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={FaInbox}
          color="green"
          change={+12}
          subtitle={`${stats.newInquiriesThisWeek} new this week`}
          link={`/t/${tenantSlug}/admin/inquiries`}
        />
        <StatCard
          title="Sales This Month"
          value={stats.salesThisMonth}
          icon={FaChartLine}
          color="purple"
          change={+8}
          link={`/t/${tenantSlug}/admin/sales`}
        />
        <StatCard
          title="Revenue"
          value={formatMoney(stats.revenue)}
          icon={FaDollarSign}
          color="yellow"
          change={+15}
          isFormatted
          link={`/t/${tenantSlug}/admin/accounting`}
        />
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
            <Link href={`/t/${tenantSlug}/admin/inventory`} className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.availableCars}</div>
              <div className="text-sm text-green-700">Available</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.reservedCars}</div>
              <div className="text-sm text-yellow-700">Reserved</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.soldCars}</div>
              <div className="text-sm text-blue-700">Sold</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/t/${tenantSlug}/admin/inventory/add`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <FaPlusCircle /> Add Car
            </Link>
            <Link
              href={`/t/${tenantSlug}/admin/inventory?status=Available`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaFilter /> Filter Stock
            </Link>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              <span className="text-3xl font-bold text-white">{stats.conversionRate}%</span>
            </div>
            <p className="text-gray-600">Inquiry to Sale Conversion</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Inquiries</span>
              <span className="font-medium">{stats.totalInquiries}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Converted Sales</span>
              <span className="font-medium">{stats.totalSales}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity tenantSlug={tenantSlug} />
        <QuickLinksPanel tenantSlug={tenantSlug} role="admin" />
      </div>
    </div>
  );
}

// ============================================
// SALES AGENT DASHBOARD
// ============================================
function SalesAgentDashboard({ tenantSlug, stats, formatMoney, userName }: {
  tenantSlug: string;
  stats: DashboardStats;
  formatMoney: (amount: number) => string;
  userName: string;
}) {
  const [leads, setLeads] = useState([
    { id: 1, name: 'John Mwale', phone: '+260971234567', car: 'Toyota Harrier 2019', status: 'New', date: '2 hours ago' },
    { id: 2, name: 'Mary Banda', phone: '+260962345678', car: 'Honda CR-V 2020', status: 'Contacted', date: '5 hours ago' },
    { id: 3, name: 'Peter Tembo', phone: '+260953456789', car: 'Nissan X-Trail 2018', status: 'Follow-up', date: '1 day ago' },
    { id: 4, name: 'Grace Phiri', phone: '+260944567890', car: 'Mazda CX-5 2021', status: 'Negotiating', date: '2 days ago' },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <p className="text-green-100 mt-1">Hello {userName}, you have {stats.newInquiriesThisWeek} new leads this week!</p>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="My Leads" value={23} icon={FaUsers} color="blue" />
        <StatCard title="This Month Sales" value={5} icon={FaChartLine} color="green" />
        <StatCard title="Pending Follow-ups" value={8} icon={FaClock} color="yellow" />
        <StatCard title="Commission" value={formatMoney(15000)} icon={FaDollarSign} color="purple" isFormatted />
      </div>

      {/* Leads Inbox */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Leads Inbox</h2>
          <div className="flex gap-2">
            <select className="text-sm border rounded-lg px-3 py-1.5" aria-label="Filter leads">
              <option>All Status</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Follow-up</option>
              <option>Negotiating</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-600">Interested in: {lead.car}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={lead.status} />
                <span className="text-xs text-gray-500">{lead.date}</span>
                <div className="flex gap-1">
                  <a href={`tel:${lead.phone}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FaPhoneAlt className="w-4 h-4" />
                  </a>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href={`/t/${tenantSlug}/admin/leads`} className="text-blue-600 hover:underline text-sm">
            View All Leads →
          </Link>
        </div>
      </div>

      {/* Follow-up Calendar */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Follow-ups</h2>
        <div className="space-y-3">
          <FollowUpItem time="10:00 AM" customer="John Mwale" action="Call back about financing" />
          <FollowUpItem time="2:00 PM" customer="Peter Tembo" action="Send updated quotation" />
          <FollowUpItem time="4:30 PM" customer="Grace Phiri" action="Schedule test drive" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACCOUNTANT DASHBOARD
// ============================================
function AccountantDashboard({ tenantSlug, stats, formatMoney, userName }: {
  tenantSlug: string;
  stats: DashboardStats;
  formatMoney: (amount: number) => string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Accounting Dashboard</h1>
        <p className="text-purple-100 mt-1">Financial overview for this month</p>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatMoney(stats.revenue)} icon={FaDollarSign} color="green" isFormatted />
        <StatCard title="Pending Payments" value={formatMoney(stats.pendingPayments)} icon={FaClock} color="yellow" isFormatted />
        <StatCard title="Installments Due" value={formatMoney(45000)} icon={FaCalculator} color="blue" isFormatted />
        <StatCard title="Expenses" value={formatMoney(125000)} icon={FaMoneyBillWave} color="red" isFormatted />
      </div>

      {/* Payment Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deposits</h2>
          <div className="space-y-3">
            <PaymentRow customer="John Mwale" car="Toyota Harrier" amount={formatMoney(75000)} type="Deposit" date="Today" />
            <PaymentRow customer="Mary Banda" car="Honda CR-V" amount={formatMoney(110000)} type="Full Payment" date="Yesterday" />
            <PaymentRow customer="Peter Tembo" car="Nissan X-Trail" amount={formatMoney(45000)} type="Installment" date="2 days ago" />
          </div>
          <Link href={`/t/${tenantSlug}/admin/accounting/payments`} className="block mt-4 text-center text-blue-600 hover:underline text-sm">
            View All Payments →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Installment Tracker</h2>
          <div className="space-y-3">
            <InstallmentRow customer="Grace Phiri" dueDate="Dec 15" amount={formatMoney(8500)} status="upcoming" />
            <InstallmentRow customer="David Zulu" dueDate="Dec 10" amount={formatMoney(12000)} status="overdue" />
            <InstallmentRow customer="Sarah Moyo" dueDate="Dec 20" amount={formatMoney(9500)} status="upcoming" />
          </div>
          <Link href={`/t/${tenantSlug}/admin/accounting/installments`} className="block mt-4 text-center text-blue-600 hover:underline text-sm">
            View All Installments →
          </Link>
        </div>
      </div>

      {/* Reports & Invoices */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={FaFileInvoice} label="Generate Invoice" href={`/t/${tenantSlug}/admin/accounting/invoices/new`} />
          <QuickActionButton icon={FaReceipt} label="Record Payment" href={`/t/${tenantSlug}/admin/accounting/payments/new`} />
          <QuickActionButton icon={FaChartLine} label="Sales Report" href={`/t/${tenantSlug}/admin/accounting/reports/sales`} />
          <QuickActionButton icon={FaCalculator} label="Installment Report" href={`/t/${tenantSlug}/admin/accounting/reports/installments`} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// CASHIER DASHBOARD
// ============================================
function CashierDashboard({ tenantSlug, stats, formatMoney, userName }: {
  tenantSlug: string;
  stats: DashboardStats;
  formatMoney: (amount: number) => string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <p className="text-teal-100 mt-1">Process payments and issue receipts</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Today's Collections" value={formatMoney(185000)} icon={FaDollarSign} color="green" isFormatted />
        <StatCard title="Transactions" value={12} icon={FaReceipt} color="blue" />
        <StatCard title="Pending" value={3} icon={FaClock} color="yellow" />
      </div>

      {/* Quick Payment Entry */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input type="text" placeholder="Search customer..." className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" placeholder="Enter amount" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>Cash</option>
              <option>Mobile Money - Airtel</option>
              <option>Mobile Money - MTN</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
              Record Payment
            </button>
          </div>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Receipt #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TransactionRow receipt="RCP-001" customer="John Mwale" amount={formatMoney(75000)} method="Cash" time="10:30 AM" />
              <TransactionRow receipt="RCP-002" customer="Mary Banda" amount={formatMoney(50000)} method="Airtel Money" time="11:45 AM" />
              <TransactionRow receipt="RCP-003" customer="Peter Tembo" amount={formatMoney(60000)} method="Bank Transfer" time="2:15 PM" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HR DASHBOARD
// ============================================
function HRDashboard({ tenantSlug, stats, userName }: {
  tenantSlug: string;
  stats: DashboardStats;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <p className="text-orange-100 mt-1">Manage staff accounts and roles</p>
      </div>

      {/* Staff Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={stats.totalStaff} icon={FaUsers} color="blue" />
        <StatCard title="Active Today" value={12} icon={FaCheckCircle} color="green" />
        <StatCard title="On Leave" value={2} icon={FaCalendarAlt} color="yellow" />
        <StatCard title="Pending Approvals" value={3} icon={FaClock} color="red" />
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Staff Directory</h2>
          <Link href={`/t/${tenantSlug}/admin/hr/staff/new`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <FaPlusCircle /> Add Staff
          </Link>
        </div>
        <div className="space-y-3">
          <StaffRow name="John Phiri" role="Sales Agent" email="john@dealer.com" status="Active" />
          <StaffRow name="Mary Banda" role="Accountant" email="mary@dealer.com" status="Active" />
          <StaffRow name="Peter Zulu" role="Cashier" email="peter@dealer.com" status="On Leave" />
          <StaffRow name="Grace Tembo" role="Sales Agent" email="grace@dealer.com" status="Active" />
        </div>
        <Link href={`/t/${tenantSlug}/admin/hr/staff`} className="block mt-4 text-center text-blue-600 hover:underline text-sm">
          View All Staff →
        </Link>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityLogItem user="John Phiri" action="Logged in" time="10 minutes ago" />
          <ActivityLogItem user="Mary Banda" action="Generated invoice #INV-123" time="1 hour ago" />
          <ActivityLogItem user="Peter Zulu" action="Recorded payment K50,000" time="2 hours ago" />
          <ActivityLogItem user="Grace Tembo" action="Updated lead status" time="3 hours ago" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// IT MANAGER DASHBOARD
// ============================================
function ITManagerDashboard({ tenantSlug, userName }: {
  tenantSlug: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">System Administration</h1>
        <p className="text-gray-300 mt-1">Monitor system health and manage features</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-xl font-bold text-green-600">Healthy</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-xl font-bold text-green-600">Connected</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaServer className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-xl font-bold text-blue-600">45%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaServer className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-xl font-bold text-green-600">99.9%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h2>
        <div className="space-y-4">
          <FeatureToggle name="Public Website" enabled={true} description="Allow public access to stock listing" />
          <FeatureToggle name="Online Payments" enabled={true} description="Accept online payments via mobile money" />
          <FeatureToggle name="Financing Module" enabled={true} description="Enable financing calculator and applications" />
          <FeatureToggle name="WhatsApp Integration" enabled={true} description="Enable WhatsApp inquiry buttons" />
          <FeatureToggle name="Maintenance Mode" enabled={false} description="Show maintenance page to visitors" />
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h2>
        <div className="space-y-2 font-mono text-sm">
          <LogEntry level="INFO" message="User john@dealer.com logged in successfully" time="10:30:45" />
          <LogEntry level="INFO" message="Payment webhook received from Airtel Money" time="10:28:12" />
          <LogEntry level="WARN" message="Rate limit reached for IP 192.168.1.100" time="10:25:33" />
          <LogEntry level="INFO" message="Backup completed successfully" time="06:00:00" />
        </div>
        <Link href={`/t/${tenantSlug}/admin/system/logs`} className="block mt-4 text-center text-blue-600 hover:underline text-sm">
          View Full Logs →
        </Link>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({ title, value, icon: Icon, color, change, subtitle, link, isFormatted }: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  change?: number;
  subtitle?: string;
  link?: string;
  isFormatted?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  const content = (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isFormatted ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700',
    'Contacted': 'bg-yellow-100 text-yellow-700',
    'Follow-up': 'bg-orange-100 text-orange-700',
    'Negotiating': 'bg-purple-100 text-purple-700',
    'Won': 'bg-green-100 text-green-700',
    'Lost': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function FollowUpItem({ time, customer, action }: { time: string; customer: string; action: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
      <div className="text-sm font-medium text-blue-600 w-20">{time}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{customer}</p>
        <p className="text-sm text-gray-600">{action}</p>
      </div>
      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
        <FaCheckCircle />
      </button>
    </div>
  );
}

function PaymentRow({ customer, car, amount, type, date }: {
  customer: string; car: string; amount: string; type: string; date: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{customer}</p>
        <p className="text-sm text-gray-600">{car}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">{amount}</p>
        <p className="text-xs text-gray-500">{type} • {date}</p>
      </div>
    </div>
  );
}

function InstallmentRow({ customer, dueDate, amount, status }: {
  customer: string; dueDate: string; amount: string; status: 'upcoming' | 'overdue' | 'paid';
}) {
  const statusColors = {
    upcoming: 'text-blue-600 bg-blue-50',
    overdue: 'text-red-600 bg-red-50',
    paid: 'text-green-600 bg-green-50',
  };
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${statusColors[status]}`}>
      <div>
        <p className="font-medium">{customer}</p>
        <p className="text-sm opacity-75">Due: {dueDate}</p>
      </div>
      <div className="font-bold">{amount}</div>
    </div>
  );
}

function TransactionRow({ receipt, customer, amount, method, time }: {
  receipt: string; customer: string; amount: string; method: string; time: string;
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 text-sm font-medium">{receipt}</td>
      <td className="py-3 px-4 text-sm">{customer}</td>
      <td className="py-3 px-4 text-sm font-medium text-green-600">{amount}</td>
      <td className="py-3 px-4 text-sm">{method}</td>
      <td className="py-3 px-4 text-sm text-gray-500">{time}</td>
      <td className="py-3 px-4">
        <button className="text-blue-600 hover:underline text-sm">Print</button>
      </td>
    </tr>
  );
}

function StaffRow({ name, role, email, status }: {
  name: string; role: string; email: string; status: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaUserTie className="text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">{role}</p>
        <span className={`text-xs px-2 py-0.5 rounded ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function ActivityLogItem({ user, action, time }: { user: string; action: string; time: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
      <span className="font-medium">{user}</span>
      <span className="text-gray-600">{action}</span>
      <span className="text-gray-400 ml-auto">{time}</span>
    </div>
  );
}

function FeatureToggle({ name, enabled, description }: { name: string; enabled: boolean; description: string }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isEnabled ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function LogEntry({ level, message, time }: { level: string; message: string; time: string }) {
  const colors: Record<string, string> = {
    INFO: 'text-blue-600',
    WARN: 'text-yellow-600',
    ERROR: 'text-red-600',
  };
  return (
    <div className="flex gap-2 p-2 bg-gray-900 text-gray-300 rounded">
      <span className="text-gray-500">[{time}]</span>
      <span className={colors[level] || 'text-gray-400'}>[{level}]</span>
      <span>{message}</span>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <Icon className="text-2xl text-blue-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

function RecentActivity({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <ActivityItem type="inquiry" title="New inquiry received" detail="John Mwale inquired about Toyota Harrier" time="2 hours ago" />
        <ActivityItem type="sale" title="Car sold" detail="Honda CR-V 2020 marked as sold" time="5 hours ago" />
        <ActivityItem type="payment" title="Payment received" detail="K75,000 deposit from Peter Tembo" time="1 day ago" />
        <ActivityItem type="stock" title="New car added" detail="Mazda CX-5 2021 added to inventory" time="2 days ago" />
      </div>
    </div>
  );
}

function ActivityItem({ type, title, detail, time }: { type: string; title: string; detail: string; time: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    inquiry: FaInbox,
    sale: FaCheckCircle,
    payment: FaDollarSign,
    stock: FaCar,
  };
  const Icon = icons[type] || FaBell;
  
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="text-blue-600 text-sm" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-sm text-gray-600">{detail}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}

function QuickLinksPanel({ tenantSlug, role }: { tenantSlug: string; role: string }) {
  const links = [
    { href: `/t/${tenantSlug}/admin/inventory/add`, icon: FaCar, label: 'Add New Car' },
    { href: `/t/${tenantSlug}/admin/customers/add`, icon: FaUsers, label: 'Add Customer' },
    { href: `/t/${tenantSlug}/admin/inquiries`, icon: FaInbox, label: 'View Inquiries' },
    { href: `/t/${tenantSlug}/admin/reports`, icon: FaChartLine, label: 'Generate Report' },
    { href: `/t/${tenantSlug}/admin/settings`, icon: FaCog, label: 'Settings' },
    { href: `/t/${tenantSlug}`, icon: FaEye, label: 'View Public Site' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
      <div className="grid grid-cols-2 gap-3">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
