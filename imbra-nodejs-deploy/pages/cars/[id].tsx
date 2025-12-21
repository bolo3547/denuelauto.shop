import Head from 'next/head';
import React from 'react';
import { makeApiUrl } from '@/lib/config/api';
import CarDetails from '../../components/CarDetails';

interface Props {
  carId: string;
  tenantSlug?: string;
  seo?: { title?: string; description?: string; image?: string };
}

import { useRouter } from 'next/router';

export default function CarDetailPage(_: Props) {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const tenantSlug = (router.query.tenantSlug as string) || 'sample-dealer';

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Car Details</title>
        <meta name="description" content={'Vehicle details and purchase information'} />
      </Head>

      <main>
        <CarDetails carId={String(id)} tenantSlug={tenantSlug} />
      </main>
    </>
  );
}
