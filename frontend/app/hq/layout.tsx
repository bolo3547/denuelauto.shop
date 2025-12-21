'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';
import { HqAdminProvider } from '@/contexts/HqAdminContext';
import {
  FaHome, FaStore, FaUserPlus, FaDollarSign, FaHeadset, FaCog, FaChartLine,
  FaUsers, FaBell, FaHistory, FaGlobe, FaSignOutAlt, FaBars, FaTimes, FaShieldAlt
} from 'react-icons/fa';

interface HqLayoutProps {
  children: ReactNode;
}

export default function HqLayout({ children }: HqLayoutProps) {
  return (
    <HqAdminProvider>
      <HqLayoutInner>{children}</HqLayoutInner>
    </HqAdminProvider>
  );
}

function HqLayoutInner({ children }: HqLayoutProps) {
  const { admin, loading, refresh, logout } = useHqAdminAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      const a = await refresh();
      if (!a) {
        router.push('/hq/login');
      }
    };
    init();
  }, [refresh, router]);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch('/api/hq/registration/pending');
        if (!res.ok) return;
        const body = await res.json();
        setPendingCount((body.items || []).length);
      } catch (e) {
        // ignore
      }
    };
    loadPending();
  }, []);

  if (loading && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading HQ Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const isSuper = admin.role === 'SUPER_ADMIN';
  const isSupport = admin.role === 'SUPPORT';
  const isFinance = admin.role === 'FINANCE';

  const navItems = [
    { href: '/hq', label: 'Dashboard', icon: FaHome, exact: true },
    { href: '/hq/tenants', label: 'Tenants', icon: FaStore },
    { href: '/hq/registration/pending', label: 'Registrations', icon: FaUserPlus, badge: pendingCount },
    { href: '/hq/billing', label: 'Billing', icon: FaDollarSign, roles: ['SUPER_ADMIN', 'FINANCE'] },
    { href: '/hq/support', label: 'Support Tickets', icon: FaHeadset, roles: ['SUPER_ADMIN', 'SUPPORT'] },
    { href: '/hq/analytics', label: 'Analytics', icon: FaChartLine, roles: ['SUPER_ADMIN'] },
    { href: '/hq/users', label: 'HQ Users', icon: FaUsers, roles: ['SUPER_ADMIN'] },
    { href: '/hq/announcements', label: 'Announcements', icon: FaBell, roles: ['SUPER_ADMIN', 'SUPPORT'] },
    { href: '/hq/audit-log', label: 'Audit Log', icon: FaHistory, roles: ['SUPER_ADMIN'] },
    { href: '/hq/settings', label: 'Settings', icon: FaCog, roles: ['SUPER_ADMIN'] },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(admin.role);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-blue-400" />
          <span className="font-bold">Denuel HQ</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-gray-900 text-white" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{admin.email}</p>
                  <p className="text-xs text-gray-400">{admin.role}</p>
                </div>
              </div>
            </div>
            <nav className="p-4">
              {navItems.filter(item => canAccess(item.roles)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                    isActive(item.href, item.exact) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white min-h-screen transition-all duration-300`}>
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-lg">Denuel HQ</h1>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.filter(item => canAccess(item.roles)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{admin.email}</p>
                  <p className="text-xs text-gray-400">{admin.role}</p>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400" title="Logout">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <button onClick={logout} className="w-full p-2 text-gray-400 hover:text-red-400 flex justify-center" title="Logout">
                <FaSignOutAlt />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <header className="bg-white border-b px-6 py-4 hidden lg:flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Toggle sidebar"
            >
              <FaBars />
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative" title="Notifications">
                <FaBell />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <a href="/" target="_blank" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Visit main site">
                <FaGlobe />
              </a>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
