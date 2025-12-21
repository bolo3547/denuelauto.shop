import type { Metadata } from 'next'
import '../styles/globals.css'
import LiveChat from '../components/LiveChat'
import Providers from '../components/Providers'
import { LoadingProvider } from '../context/LoadingContext'
import dynamic from 'next/dynamic'
import Pwa from '../components/Pwa'
import UTMTracker from '../components/UTMTracker'
const ApiFetchShim = dynamic(() => import('../components/ApiFetchShim'), { ssr: false });

const StickyContactMount = dynamic(() => import('../components/StickyContactMount'), { ssr: false });
const SearchBox = dynamic(() => import('../components/SearchBox'), { ssr: false });

export const metadata: Metadata = {
  title: 'Denuel Auto',
  description: 'Car dealership management system',
  metadataBase: new URL('https://denuel.example'),
  openGraph: {
    title: 'Denuel Auto — Sell faster, ship globally',
    description: 'Car dealership platform for listing, proformas, and export shipping.',
    url: 'https://denuel.example',
    siteName: 'Denuel Auto',
    images: [
      {
        url: '/hero-mock.svg',
        width: 1200,
        height: 630,
        alt: 'Denuel Auto screenshot'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Denuel Auto — Sell faster, ship globally',
    description: 'Car dealership platform for listing, proformas, and export shipping.',
    images: ['/hero-mock.svg']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F3D91" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        <LoadingProvider>
          <Providers>
            <ApiFetchShim />
            <UTMTracker />
            <div className="absolute right-6 top-6 z-50"><SearchBox /></div>
            {children}
            {/* Sticky contact UI for quick actions (client only) */}
            <StickyContactMount />
          </Providers>
        </LoadingProvider>
        <LiveChat />
        {/* PWA registration */}
        <Pwa />
        {/* Sticky contact (client-side) */}
        <div id="sticky-contact-root"></div>
      </body>
    </html>
  )
}