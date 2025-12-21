import React from 'react';
import DealerLayout from '../../components/dealer/DealerLayout';
import { tenantTheme } from '../../lib/tenantMock';

export default function Layout({ children }: { children: React.ReactNode }){
  return <DealerLayout tenantTheme={tenantTheme}>{children}</DealerLayout>;
}
