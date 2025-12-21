"use client";
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/utils/analytics';
import { auditPage } from '@/utils/accessibility';

export default function PageAnalytics({ pageName }: { pageName: string }){
  const pathname = usePathname();
  useEffect(() => {
    try { trackEvent('page_view', { page: pageName || pathname }); } catch (e) {}
    if (process.env.NODE_ENV !== 'production') {
      try { auditPage(); } catch (e) { /* ignore */ }
    }
  }, [pathname, pageName]);

  return null;
}
