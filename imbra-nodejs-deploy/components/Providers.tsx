"use client";

import React from 'react';
import TenantThemeProvider from '@/contexts/TenantThemeContext';
import { SubscriptionProvider } from '@/lib/subscription';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantThemeProvider>
      <ThemeProvider>
        <SubscriptionProvider tenantId="">
          {children}
        </SubscriptionProvider>
      </ThemeProvider>
    </TenantThemeProvider>
  );
}
