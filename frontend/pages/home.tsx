import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const DenuelAutoHome = dynamic(() => import('../components/DenuelAutoHome.clean'), { ssr: false });

export default function HomeAlias() {
  return (
    <>
      <Head>
        <title>Home — Denuel Auto</title>
        <meta name="description" content="Denuel Auto home" />
      </Head>
      <DenuelAutoHome />
    </>
  );
}
