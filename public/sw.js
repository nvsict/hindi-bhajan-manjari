const CACHE_NAME = 'bhajan-cache-v1';

// ==========================================
// 1. OFFLINE CACHING ENGINE
// ==========================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/saved']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 🌟 FIXED 1: Ignore non-GET requests
  if (event.request.method !== 'GET') return;
  
  // 🌟 FIXED 2: Ignore chrome extensions and non-HTTP requests (Stops the annoying console errors)
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
    return;
  }

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
        // Serve from cache if offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse; // 1. कैश में मिला, तो दिखा दो
          }
          
          // 🌟 THE BULLETPROOF FIX: Prevent "TypeError: Failed to convert value to 'Response'"
          // 2. अगर इंटरनेट बंद है और पेज कैश में भी नहीं है, तो क्रैश होने के बजाय यह ऑफलाइन पेज दिखाओ।
          return new Response(
            "<html><body style='background:#fffaf0;color:#ea580c;text-align:center;padding:50px;font-family:sans-serif;'><h2>🙏 जय श्री राम!</h2><p>आप अभी ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।</p></body></html>",
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
            }
          );
        });
      })
  );
});

// ==========================================
// 2. PUSH NOTIFICATION ENGINE
// ==========================================
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      // 🌟 FIXED: Changed to .png. Android will fail to render .ico files!
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
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('hindibhajanmanjari.com') && 'focus' in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // Open new window if app is closed
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});