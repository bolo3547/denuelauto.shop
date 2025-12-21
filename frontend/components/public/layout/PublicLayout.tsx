'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TenantThemeProvider, { TenantPublicSettings } from '../tenant/TenantThemeProvider';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import FloatingWidgets from './FloatingWidgets';
import Breadcrumbs from './Breadcrumbs';

interface PublicLayoutProps {
  tenantSlug: string;
  initialSettings?: Partial<TenantPublicSettings>;
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export default function PublicLayout({
  tenantSlug,
  initialSettings,
  children,
  showBreadcrumbs = true,
}: PublicLayoutProps) {
  const pathname = usePathname();

  // Determine if we should show breadcrumbs (not on homepage)
  const isHomePage = pathname === `/t/${tenantSlug}` || pathname === `/t/${tenantSlug}/`;
  const shouldShowBreadcrumbs = showBreadcrumbs && !isHomePage;

  return (
    <TenantThemeProvider tenantSlug={tenantSlug} initialSettings={initialSettings}>
      <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--text)]">
        {/* Header */}
        <PublicHeader tenantSlug={tenantSlug} />

        {/* Breadcrumbs */}
        {shouldShowBreadcrumbs && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <Breadcrumbs tenantSlug={tenantSlug} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <PublicFooter tenantSlug={tenantSlug} />

        {/* Floating Widgets (WhatsApp, Call, Back to Top) */}
        <FloatingWidgets tenantSlug={tenantSlug} />
      </div>
    </TenantThemeProvider>
  );
}
