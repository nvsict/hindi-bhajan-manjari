// ==========================================
// 🌟 1. BHAJAN APP LOGIC (PWA & CACHE)
// ==========================================
const CACHE_NAME = 'bhajan-cache-v4'; // Version bumped to v3 for safety

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Basic UI shell
      return cache.addAll(['/', '/saved']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!(url.protocol === 'http:' || url.protocol === 'https:')) return;

  // 🚨 CRITICAL: Never cache these!
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/admin') ||
    url.pathname === '/pay.html' ||
    url.hostname.includes('razorpay.com') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('clarity.ms')
  ) {
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          // 🌟 MAGIC: अगर यह कोई Asset है या Next.js का Data (RSC) है, तो उसे हमेशा कैश करो
          const isPageOrAsset = 
            event.request.headers.get('accept')?.includes('text/html') ||
            url.pathname.includes('/_next/') ||
            url.pathname.match(/\.(css|js|woff2?|png|jpg|jpeg|svg)$/);

          if (isPageOrAsset) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(async () => {
        // 🚨 OFFLINE MODE MAGIC
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 🌟 Next.js RSC Fallback (अगर ऐप ने .txt या .json मांगा और वो नहीं मिला)
        if (event.request.headers.get('accept')?.includes('text/x-component') || event.request.url.includes('?_rsc')) {
            // Return empty 200 response so the app doesn't crash, it just falls back to cached HTML
            return new Response('', { status: 200, headers: { 'Content-Type': 'text/x-component' } });
        }
        
        // 🌟 HTML Fallback Page
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return new Response(
            "<html><body style='background:#fffaf0;color:#ea580c;text-align:center;padding:50px;font-family:sans-serif;'><h2>🙏 जय श्री राम!</h2><p>आप अभी ऑफ़लाइन हैं और यह पेज आपके संग्रह में सेव नहीं है।</p></body></html>",
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
            }
          );
        }

        // 🌟 FIX: Safety net for all other failed requests (Images, Fonts, etc. when offline)
        return new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});

// ==========================================
// 🌟 2. CUSTOM PUSH NOTIFICATION ENGINE
// ==========================================
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      if (data && data.title) {
        const options = {
          // 🌟 THE FIX: Accept 'message' from the backend payload
          body: data.message || data.body || '', 
          icon: '/logo.png', 
          badge: '/logo.png', 
          vibrate: [200, 100, 200], 
          tag: 'bhajan-notification',
          renotify: true,
          requireInteraction: true,
          data: { url: data.url || '/' },
          actions: [{ action: 'open_url', title: 'अभी पढ़ें (Read Now)' }]
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
      }
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  if (event.notification.data && event.notification.data.url) {
    event.notification.close();
    const targetUrl = event.notification.data.url;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('hindibhajanmanjari.com') && 'focus' in client) {
            return client.focus().then(() => client.navigate(targetUrl));
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
    );
  }
});