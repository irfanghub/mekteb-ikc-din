// IKC DIN Mekteb — Service Worker voor push notificaties
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;
  const d = event.data.json();
  event.waitUntil(
    self.registration.showNotification(d.title || 'Mekteb IKC DIN', {
      body: d.body || '',
      icon: 'https://mekteb-app-ikc-din.vercel.app/icon-192.png',
      badge: 'https://mekteb-app-ikc-din.vercel.app/icon-192.png',
      tag: d.tag || 'mekteb',
      renotify: true,
      data: { url: 'https://mekteb-app-ikc-din.vercel.app' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('mekteb-app') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('https://mekteb-app-ikc-din.vercel.app');
    })
  );
});
