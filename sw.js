const CACHE_VERSION = 'v2';
const SHELL = [
  './',
  './index.html',
  './pokedex.html',
  './style.css',
  './supabase-config.js',
  './pokemon-data.js',
  './pokemon-sprites.js',
  './evolution-lines.js',
  './auth.js',
  './app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first for Supabase API and PokeAPI
  if (url.hostname.includes('supabase') || url.hostname.includes('pokeapi')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Network-first for JS/CSS (version-busted) to always get latest
  if (url.pathname.match(/\.(js|css)$/) && url.searchParams.has('v')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for other shell assets (HTML, etc.)
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
