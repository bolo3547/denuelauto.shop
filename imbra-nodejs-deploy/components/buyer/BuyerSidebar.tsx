import React from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: './dashboard' },
  { label: 'My Cars', href: './cars' },
  { label: 'Profile', href: './profile' },
  { label: 'Favorites', href: './favorites' },
  { label: 'Orders & Payments', href: './orders' },
  { label: 'Messages & Support', href: './messages' },
  { label: 'Notifications', href: './notifications' },
];

export default function BuyerSidebar({ active }: { active?: string }) {
  return (
    <aside className="w-64 min-h-screen bg-gray-50 border-r px-4 py-8">
      <nav className="space-y-2">
        {navItems.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`block px-4 py-2 rounded text-gray-700 hover:bg-blue-100 font-medium ${active === item.label ? 'bg-blue-600 text-white' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
