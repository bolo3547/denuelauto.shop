'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface BreadcrumbsProps {
  tenantSlug: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  stock: 'Browse Stock',
  help: 'Help Center',
  'how-to-buy': 'How to Buy',
  'how-to-pay': 'How to Pay',
  faq: 'FAQ',
  contact: 'Contact Us',
  locations: 'Our Locations',
  account: 'My Account',
  favorites: 'My Favorites',
  compare: 'Compare Cars',
  'saved-searches': 'Saved Searches',
  inquiries: 'My Inquiries',
  auth: 'Authentication',
  login: 'Login',
  register: 'Create Account',
  about: 'About Us',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  financing: 'Financing',
  cif: 'CIF Calculator',
  blog: 'Blog',
  news: 'News',
  reviews: 'Reviews',
};

export default function Breadcrumbs({ tenantSlug }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Parse the pathname to create breadcrumb items
  const pathParts = (pathname || '')
    .replace(`/t/${tenantSlug}`, '')
    .split('/')
    .filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [
    { label: 'Home', href: `/t/${tenantSlug}`, isLast: pathParts.length === 0 },
  ];

  let currentPath = `/t/${tenantSlug}`;
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === pathParts.length - 1;

    // Try to get a nice label
    let label = routeLabels[part] || part;

    // Handle dynamic segments (like stock numbers)
    if (part.match(/^[A-Z0-9-]+$/i) && pathParts[index - 1] === 'stock') {
      label = `Stock #${part}`;
    }

    // Capitalize if no label found
    if (label === part) {
      label = part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    breadcrumbs.push({ label, href: currentPath, isLast });
  });

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-gray-600 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((crumb, index) => (
          <li
            key={crumb.href}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && <FaChevronRight className="text-gray-400 text-xs" />}
            {crumb.isLast ? (
              <span className="text-gray-900 font-medium" itemProp="name">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-[var(--accent)] hover:underline transition-colors flex items-center gap-1"
                itemProp="item"
              >
                {index === 0 && <FaHome className="text-xs" />}
                <span itemProp="name">{crumb.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
