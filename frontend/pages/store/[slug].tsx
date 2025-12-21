import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import PublicWebsite from '../PublicWebsite';

export default function StorefrontPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(false);
    }
  }, [slug]);

  if (loading || !slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading storefront...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{typeof slug === 'string' ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Dealership'} | Car Dealership</title>
        <meta name="description" content="Browse our selection of quality vehicles" />
        {/* Load Poppins font for professional blue theme */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>{`body { font-family: var(--font-family, 'Poppins, sans-serif'); }`}</style>
      </Head>
      <PublicWebsite tenantSlug={slug as string} />
    </>
  );
}
