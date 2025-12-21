'use client';

import React, { useEffect } from 'react';

export type TenantTheme = {
  primary?: string;
  accent?: string;
  surface?: string;
  text?: string;
};

export default function TenantThemeProvider({ theme, children }: { theme?: TenantTheme; children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--primary', theme?.primary ?? '#000000');
    root.setProperty('--accent', theme?.accent ?? '#ff7a00');
    root.setProperty('--surface', theme?.surface ?? '#ffffff');
    root.setProperty('--text', theme?.text ?? '#0f172a');

    // Additional tokens
    root.setProperty('--header-bg', 'var(--surface)');
    // TODO: Consider using CSS variables for spacing and radius
    return () => {
      // cleanup: not strictly necessary
    };
  }, [theme]);

  return <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>{children}</div>;
}
