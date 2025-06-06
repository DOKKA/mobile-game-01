// Offline cache service worker
/* Service Worker: cache-first */
const CACHE_NAME = 'sweet-swipe-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/sound.js',
  '/manifest.webmanifest'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
