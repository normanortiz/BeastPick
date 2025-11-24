// Service Worker for Beast Pick PWA
const CACHE_NAME = 'beastpick-v2';
const urlsToCache = [
  '/voting.html',
  '/css/global.css',
  '/css/contestant.css',
  '/js/auth.js',
  '/js/data.js',
  '/js/contestant.js',
  '/images/app-icon.png',
  '/images/apple-touch-icon.png',
  '/images/BeastPick.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
