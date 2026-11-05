// ============================================================
//  MARACAJU - SERVICE WORKER (PWA Offline Cache)
// ============================================================

const CACHE_NAME = 'maracaju-v2.0.6';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/animations.css',
  './js/config.js',
  './js/currency.js',
  './js/categories.js',
  './js/projects.js',
  './js/auth.js',
  './js/storage.js',
  './js/audio.js',
  './js/gamification.js',
  './js/tasks.js',
  './js/shopping.js',
  './js/nfce.js',
  './js/history.js',
  './js/carro.js',
  './js/reformas.js',
  './js/sonhos.js',
  './js/sheets.js',
  './js/ui.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[SW] Aviso ao cachear ${url}:`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purgando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas do Google Apps Script ou APIs externas
  if (url.origin !== self.location.origin || url.pathname.includes('script.google.com')) {
    return;
  }

  // 1. Para navegações e documentos HTML: Network First, fallback Cache
  const isDocument = event.request.mode === 'navigate' ||
                     event.request.destination === 'document' ||
                     url.pathname.endsWith('/') ||
                     url.pathname.endsWith('.html');

  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // 2. Para arquivos de código (JS e CSS): Network First, fallback Cache
  // Garante que o celular receba a versão mais recente imediatamente quando online
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Demais assets (ícones, imagens): Cache First, fallback Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => null);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
