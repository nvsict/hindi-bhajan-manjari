// Listen for incoming push messages
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      // Using your existing favicon
      icon: '/favicon.ico', 
      // The badge is the tiny icon shown in the Android status bar
      badge: '/favicon.ico', 
      vibrate: [200, 100, 200], 
      
      // 🌟 IMPROVEMENT: Group notifications so they don't stack up 50 times
      tag: 'bhajan-notification',
      renotify: true,
      
      // 🌟 IMPROVEMENT: Standard behavior for mobile (prevents disappearing too fast)
      requireInteraction: true,

      data: {
        url: data.url || '/', 
      },
      
      // Adding a standard "Read Now" action button
      actions: [
        {
          action: 'open_url',
          title: 'अभी पढ़ें (Read Now)'
        }
      ]
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Listen for clicks on the notification or action buttons
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  // Extract the URL from the data object
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open with our site, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes('hindibhajanmanjari.com') && 'focus' in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // Otherwise, open a brand new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});