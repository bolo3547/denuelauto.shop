import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Load the clean home as a client component
const DenuelAutoHome = dynamic(() => import('../components/DenuelAutoHome.clean'), { ssr: false });

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Denuel Auto</title>
        <meta name="description" content="Denuel Auto - dealership operating system" />
      </Head>
      <DenuelAutoHome />
    </>
  );
}
