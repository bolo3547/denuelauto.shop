"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function Footer(){
  const [support, setSupport] = useState<{ supportEmail?: string; primaryPhone?: string; secondaryPhone?: string } | null>(null);

  useEffect(() => {
    fetch('/api/hq/public/support-info')
      .then(r => r.json())
      .then(j => setSupport(j))
      .catch(() => setSupport(null));
  }, []);

  const email = support?.supportEmail || process.env.NEXT_PUBLIC_SALES_EMAIL || '';
  const phone = support?.primaryPhone || process.env.NEXT_PUBLIC_SALES_PHONE || '';
  const altPhone = support?.secondaryPhone || '';

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-white/10 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-600 dark:text-slate-300">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || 'Denuel Auto'}</div>
            <div className="text-xs mt-2">{email}{phone ? ` · ${phone}` : ''}{altPhone ? ` · ${altPhone}` : ''}</div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="text-xs mt-4 text-gray-400">© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || 'Denuel Auto'}. All rights reserved.</div>
      </div>
    </footer>
  );
}
