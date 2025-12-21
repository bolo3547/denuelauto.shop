'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaHome,
  FaBuilding,
  FaDollarSign,
  FaChartBar,
  FaCog,
  FaUsers,
  FaBell,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaPalette,
    FaServer,
    FaQuestionCircle,
} from 'react-icons/fa';
import { getAuthSession, clearAuthSession, AuthUser } from '@/lib/auth-client';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check auth using new auth system
    const session = getAuthSession();
    if (!session && pathname !== '/super-admin/login') {
      router.push('/login?redirect=/super-admin');
      return;
    }
    if (session) {
      // Verify user is a super admin
      if (session.user.type !== 'hq_admin') {
        clearAuthSession();
        router.push('/login?redirect=/super-admin&error=unauthorized');
        return;
      }
      setUser(session.user);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  const navItems = [
    { href: '/super-admin', icon: FaHome, label: 'Dashboard', exact: true },
    { href: '/super-admin/tenants', icon: FaBuilding, label: 'Tenants' },
    { href: '/super-admin/users', icon: FaUsers, label: 'Users' },
    { href: '/super-admin/payments', icon: FaDollarSign, label: 'Payments' },
    { href: '/super-admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { href: '/super-admin/branding', icon: FaPalette, label: 'Branding' },
    { href: '/super-admin/monitoring', icon: FaServer, label: 'Monitoring' },
    { href: '/super-admin/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  // Show minimal layout for login page
  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
        <div className="flex items-center space-x-2">
          <FaShieldAlt className="w-6 h-6" />
          <span className="font-bold text-lg">Denuel HQ</span>
        </div>
        <button className="p-2 relative">
          <FaBell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold dark:text-white">{user?.fullName || 'Admin'}</p>
                  <p className="text-sm text-gray-500">{user?.role || 'SUPER_ADMIN'}</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300`}>
          {/* Logo */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="font-bold text-lg">Denuel HQ</h1>
                    <p className="text-xs text-gray-400">Super Admin</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
                <FaBars className="w-4 h-4" />
              </button>
            </div>
          </div>


          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive(item.href, item.exact)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-700">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400" title="Logout">
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full flex justify-center p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400" title="Logout">
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <header className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {navItems.find(item => isActive(item.href, item.exact))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              </button>

              {/* Help */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FaQuestionCircle className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <FaBell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Super Admin'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}