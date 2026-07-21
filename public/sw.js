// ==========================================
// 🌟 1. BHAJAN APP LOGIC (PWA & CACHE)
// ==========================================
const CACHE_NAME = 'bhajan-cache-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
            return caches.delete(cache); // Clear old caches
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🌟 FIX 1: Ignore non-GET requests
  if (event.request.method !== 'GET') return;
  
  // 🌟 FIX 2: Ignore chrome extensions and non-HTTP requests
  if (!(url.protocol === 'http:' || url.protocol === 'https:')) return;

  // 🌟 FIX 3: CRITICAL! NEVER intercept API routes or Razorpay calls!
  // Let the browser handle APIs natively. NEVER return offline HTML for APIs!
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('razorpay.com') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('clarity.ms')
  ) {
    return; // Passes directly to browser network stack
  }

  // 🌟 FIX 4: Only handle same-origin requests (your domain)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 🌟 ONLY return Offline HTML if user is navigating a PAGE (HTML request)
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return new Response(
              "<html><body style='background:#fffaf0;color:#ea580c;text-align:center;padding:50px;font-family:sans-serif;'><h2>🙏 जय श्री राम!</h2><p>आप अभी ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।</p></body></html>",
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
              }
            );
          }
        });
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
          body: data.body,
          icon: '/logo.png', 
          badge: '/logo.png', 
          vibrate: [200, 100, 200], 
          tag: 'bhajan-notification',
          renotify: true,
          requireInteraction: true,
          data: {
            url: data.url || '/', 
          },
          actions: [
            {
              action: 'open_url',
              title: 'अभी पढ़ें (Read Now)'
            }
          ]
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
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});