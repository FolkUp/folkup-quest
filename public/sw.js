/**
 * FolkUp Quest — Service Worker
 * Cache-first strategy for full offline support after first visit.
 */

const CACHE_VERSION = 'quest-v1';

const PRECACHE_URLS = [
  '/',
  '/story.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/fonts/fonts.css',
  '/legal/privacy.html',
  '/legal/terms.html',
  '/legal/cookies.html',
];

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first, fallback to network, then cache response
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip analytics and external requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached, but update in background (stale-while-revalidate for HTML/JSON)
        if (request.url.endsWith('.html') || request.url.endsWith('.json') || request.url === url.origin + '/') {
          event.waitUntil(
            fetch(request).then((networkResponse) => {
              if (networkResponse.ok) {
                return caches.open(CACHE_VERSION).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            }).catch(() => {})
          );
        }
        return cached;
      }

      // Not in cache — fetch from network and cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse.ok) return networkResponse;

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline and not cached — return offline fallback for navigation
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
