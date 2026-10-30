const CACHE_NAME = 'pm-osons-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/logo/pm-osons-oser-1.jpg',
];

// 1. Installation avec mise en cache sécurisée
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Échec précache pour : ${asset}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. Activation & nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Interception Réseau robuste sans Rejection Uncaught
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET ou les requêtes vers des API / extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Pour la navigation entre pages HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        const offlineResponse = await cache.match(OFFLINE_URL);
        if (offlineResponse) return offlineResponse;

        // Fallback ultime si rien n'est en cache pour éviter le crash JS
        return new Response('Connexion interrompue', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
        });
      })
    );
    return;
  }

  // Pour les autres ressources (images, scripts, styles)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Évite le rejet non capturé si le réseau échoue sur une ressource
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        })
      );
    })
  );
});