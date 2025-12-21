export function generateStaticParams() { return [{ id: 'placeholder' }]; }

import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const ClientCarDetail = dynamic(() => import('./ClientCarDetail'), { ssr: false });

export const metadata: Metadata = {
  title: 'Car Details',
};

export default function CarDetailPage() {
  return <ClientCarDetail />;
}

// Removed original client code

// "use client";

// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { cars } from '../../../../lib/tenantMock';
// import TrustBadge from '@/components/TrustBadge';
// import InspectionReport from '@/components/InspectionReport';
// import { generateTelemetry } from '@/lib/telemetryMock';

// export default function CarDetailPageClient() {
//   // Original client code removed
// }
