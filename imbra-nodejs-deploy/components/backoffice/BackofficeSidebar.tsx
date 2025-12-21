"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome, FaCar, FaUsers, FaDollarSign, FaChartBar,
  FaCog, FaBell, FaSignOutAlt, FaBars, FaTimes,
  FaInbox, FaFileInvoice, FaUserTie, FaCalculator,
  FaReceipt, FaUserCog, FaHistory, FaServer, FaToggleOn,
  FaPalette, FaImage, FaBullhorn, FaComments, FaShieldAlt,
  FaClipboardList, FaChevronDown, FaChevronRight
} from 'react-icons/fa';

type UserRole = 'admin' | 'sales_agent' | 'accountant' | 'hr' | 'it_manager' | 'cashier';

interface BackofficeSidebarProps {
  tenantSlug: string;
  userRole: UserRole;
  userName: string;
  tenantName?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  children?: NavItem[];
  roles?: UserRole[];
}

export default function BackofficeSidebar({
  tenantSlug,
  userRole,
  userName,
  tenantName = 'Denuel Auto',
  collapsed = false,
  onToggle,
}: BackofficeSidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['inventory', 'sales']);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  // Define navigation items with role-based access
  const navItems: NavItem[] = [
    {
      href: `/t/${tenantSlug}/admin`,
      icon: FaHome,
      label: 'Dashboard',
      roles: ['admin', 'sales_agent', 'accountant', 'hr', 'it_manager', 'cashier'],
    },
    {
      href: `/t/${tenantSlug}/admin/inventory`,
      icon: FaCar,
      label: 'Inventory',
      roles: ['admin', 'sales_agent', 'it_manager'],
      children: [
        { href: `/t/${tenantSlug}/admin/inventory`, icon: FaClipboardList, label: 'All Cars' },
        { href: `/t/${tenantSlug}/admin/inventory/add`, icon: FaCar, label: 'Add Car' },
        { href: `/t/${tenantSlug}/admin/inventory/categories`, icon: FaCog, label: 'Categories' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/inquiries`,
      icon: FaInbox,
      label: 'Inquiries',
      badge: 12,
      roles: ['admin', 'sales_agent'],
    },
    {
      href: `/t/${tenantSlug}/admin/sales`,
      icon: FaDollarSign,
      label: 'Sales',
      roles: ['admin', 'sales_agent', 'accountant'],
      children: [
        { href: `/t/${tenantSlug}/admin/sales`, icon: FaChartBar, label: 'Overview' },
        { href: `/t/${tenantSlug}/admin/sales/leads`, icon: FaUsers, label: 'Leads Pipeline' },
        { href: `/t/${tenantSlug}/admin/sales/deals`, icon: FaFileInvoice, label: 'Deals' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/customers`,
      icon: FaUsers,
      label: 'Customers',
      roles: ['admin', 'sales_agent', 'accountant'],
    },
    {
      href: `/t/${tenantSlug}/admin/financing`,
      icon: FaCalculator,
      label: 'Financing',
      roles: ['admin', 'sales_agent', 'accountant'],
      children: [
        { href: `/t/${tenantSlug}/admin/financing`, icon: FaClipboardList, label: 'Applications' },
        { href: `/t/${tenantSlug}/admin/financing/installments`, icon: FaReceipt, label: 'Installments' },
        { href: `/t/${tenantSlug}/admin/financing/calculator`, icon: FaCalculator, label: 'Calculator' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/accounting`,
      icon: FaFileInvoice,
      label: 'Accounting',
      roles: ['admin', 'accountant', 'cashier'],
      children: [
        { href: `/t/${tenantSlug}/admin/accounting`, icon: FaChartBar, label: 'Overview' },
        { href: `/t/${tenantSlug}/admin/accounting/payments`, icon: FaDollarSign, label: 'Payments' },
        { href: `/t/${tenantSlug}/admin/accounting/invoices`, icon: FaFileInvoice, label: 'Invoices' },
        { href: `/t/${tenantSlug}/admin/accounting/receipts`, icon: FaReceipt, label: 'Receipts' },
        { href: `/t/${tenantSlug}/admin/accounting/reports`, icon: FaChartBar, label: 'Reports' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/hr`,
      icon: FaUserTie,
      label: 'HR & Staff',
      roles: ['admin', 'hr'],
      children: [
        { href: `/t/${tenantSlug}/admin/hr`, icon: FaUsers, label: 'Staff Directory' },
        { href: `/t/${tenantSlug}/admin/hr/roles`, icon: FaShieldAlt, label: 'Roles & Permissions' },
        { href: `/t/${tenantSlug}/admin/hr/activity`, icon: FaHistory, label: 'Activity Logs' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/analytics`,
      icon: FaChartBar,
      label: 'Analytics',
      roles: ['admin', 'it_manager'],
    },
    {
      href: `/t/${tenantSlug}/admin/marketing`,
      icon: FaBullhorn,
      label: 'Marketing',
      roles: ['admin'],
      children: [
        { href: `/t/${tenantSlug}/admin/marketing/banners`, icon: FaImage, label: 'Banners' },
        { href: `/t/${tenantSlug}/admin/marketing/promotions`, icon: FaBullhorn, label: 'Promotions' },
        { href: `/t/${tenantSlug}/admin/marketing/seo`, icon: FaCog, label: 'SEO Settings' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/communications`,
      icon: FaComments,
      label: 'Communications',
      roles: ['admin', 'sales_agent'],
      children: [
        { href: `/t/${tenantSlug}/admin/communications/inbox`, icon: FaInbox, label: 'Inbox' },
        { href: `/t/${tenantSlug}/admin/communications/whatsapp`, icon: FaComments, label: 'WhatsApp' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/settings`,
      icon: FaCog,
      label: 'Settings',
      roles: ['admin', 'it_manager'],
      children: [
        { href: `/t/${tenantSlug}/admin/settings/general`, icon: FaCog, label: 'General' },
        { href: `/t/${tenantSlug}/admin/settings/theme`, icon: FaPalette, label: 'Theme & Branding' },
        { href: `/t/${tenantSlug}/admin/settings/branches`, icon: FaHome, label: 'Branches' },
        { href: `/t/${tenantSlug}/admin/settings/pricing`, icon: FaDollarSign, label: 'Pricing Rules' },
      ],
    },
    {
      href: `/t/${tenantSlug}/admin/system`,
      icon: FaServer,
      label: 'System',
      roles: ['admin', 'it_manager'],
      children: [
        { href: `/t/${tenantSlug}/admin/system/health`, icon: FaServer, label: 'System Health' },
        { href: `/t/${tenantSlug}/admin/system/logs`, icon: FaHistory, label: 'Logs' },
        { href: `/t/${tenantSlug}/admin/system/features`, icon: FaToggleOn, label: 'Feature Toggles' },
      ],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">{tenantName}</h1>
              <p className="text-xs text-gray-400">Backoffice</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {userName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-gray-400 capitalize">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item, idx) => (
            <li key={idx}>
              {item.children ? (
                // Parent with children
                <div>
                  <button
                    onClick={() => toggleMenu(item.label.toLowerCase())}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isParentActive(item)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      expandedMenus.includes(item.label.toLowerCase())
                        ? <FaChevronDown className="w-3 h-3" />
                        : <FaChevronRight className="w-3 h-3" />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {!collapsed && expandedMenus.includes(item.label.toLowerCase()) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.children.map((child, childIdx) => (
                        <li key={childIdx}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Single item
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href={`/t/${tenantSlug}`}
          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors mb-2"
        >
          <FaCar className="w-5 h-5" />
          {!collapsed && <span className="text-sm">View Public Site</span>}
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
