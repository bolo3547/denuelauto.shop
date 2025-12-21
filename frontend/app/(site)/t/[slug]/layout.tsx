'use client';
import '../../../../styles/globals.css';
import React from 'react';
import DealerHeader from '../../../../components/DealerHeader';
import DealerFooter from '../../../../components/DealerFooter';
import TenantThemeProvider, { useTenantTheme } from '../../../../contexts/TenantThemeContext';
// metadata should be exported from a server component; layout is a client component
export default function TenantLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  return (
    <TenantThemeProvider>
      <TenantThemeApplier slug={params.slug}>
        <div className="tenant-theme" data-primary={undefined} data-accent={undefined}>
          <DealerHeader theme={undefined} slug={params.slug} />
          <main className="min-h-[70vh] pt-6">{children}</main>
          <DealerFooter theme={undefined} />
        </div>
      </TenantThemeApplier>
    </TenantThemeProvider>
  );
}

function TenantThemeApplier({ children, slug }: { children: React.ReactNode; slug: string }) {
  const { theme } = useTenantTheme();
  const styles: Record<string, string> = {};
  if (theme) {
    if (theme.primaryColor) styles['--primary'] = theme.primaryColor;
    if (theme.accentColor) styles['--accent'] = theme.accentColor;
    if (theme.backgroundColor) styles['--bg'] = theme.backgroundColor;
  }
  return (
    <div style={styles} data-tenant={slug}>
      {children}
    </div>
  );
}
