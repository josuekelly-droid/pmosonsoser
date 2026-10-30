const CACHE_NAME = 'pm-osons-v1';
const OFFLINE_URL = '/offline';

// Fichiers de base à mettre en cache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/logo/pm-osons-oser-1.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // On met en cache les ressources une par une pour éviter un échec global
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[Service Worker] Échec de mise en cache pour : ${asset}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Stratégie : Network First (essaie le réseau, puis le cache / fallback offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        return cachedResponse || cache.match(OFFLINE_URL) || Response.error();
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});