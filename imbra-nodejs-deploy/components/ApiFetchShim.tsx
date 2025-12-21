"use client"
import { useEffect } from 'react';
import { makeApiUrl } from '@/lib/config/api';

export default function ApiFetchShim() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch.bind(window);

    // Replace window.fetch to rewrite same-origin /api requests to configured API base
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        let url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
        if (url.startsWith('/api')) {
          const newUrl = makeApiUrl(url);
          // If input was a Request, create a new Request preserving options
          if (input instanceof Request) {
            const newReq = new Request(newUrl, input);
            return originalFetch(newReq);
          }
          return originalFetch(newUrl, init);
        }
      } catch (e) {
        // fallback to original fetch on error
        console.warn('ApiFetchShim error, falling back to native fetch', e);
      }
      return originalFetch(input, init);
    };

    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.warn('[ApiFetchShim] NEXT_PUBLIC_API_BASE_URL is not set. /api requests will remain relative.');
    }

    return () => { window.fetch = originalFetch; };
  }, []);

  return null;
}
