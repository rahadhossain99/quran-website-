const CACHE_NAME = 'quran-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Claim clients immediately
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'আল-কুরআন';
  const options = {
    body: data.body || 'আপনার জন্য নতুন নোটিফিকেশন আছে।',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'general',
    data: data.url || '/'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
