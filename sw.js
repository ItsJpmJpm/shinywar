// Service Worker self-destructed — was causing stale cache issues
// This file unregisters itself and clears all caches
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  ).then(() => self.unregister());
});
