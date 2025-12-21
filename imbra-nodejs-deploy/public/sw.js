const CACHE_NAME = 'denuel-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, '/'])).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests for same-origin HTTP/HTTPS resources.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!/^https?:$/i.test(url.protocol)) return; // ignore chrome-extension:// and others
  // Optionally only cache same origin assets
  if (url.origin !== self.location.origin) return;

  // stale-while-revalidate for same-origin GET requests
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    try {
      const networkResp = await fetch(req);
      // only cache successful responses
      if (networkResp && networkResp.ok) {
        try { await cache.put(req, networkResp.clone()); } catch (err) { /* swallow put errors */ }
      }
      return cached || networkResp;
    } catch (err) {
      // if network fails, return cached, otherwise propagate error
      return cached || Response.error();
    }
  })());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Denuel Cars Notification';
  const options = { body: data.body || '', data: data, tag: data.tag || undefined };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.deep_link || '/';
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
