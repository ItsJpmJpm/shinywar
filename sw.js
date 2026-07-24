self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.matchAll())
      .then(clients => {
        const navs = clients.map(c => c.navigate(c.url));
        self.unregister();
        return Promise.all(navs);
      })
  );
});
