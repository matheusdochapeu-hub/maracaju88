// ============================================================
//  MARACAJU - SERVICE WORKER (PWA Offline Cache)
// ============================================================

const CACHE_NAME = 'maracaju-v2.7.2';

// Página de contingência quando o app abre offline e o index.html não está no cache
const OFFLINE_HTML = `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Maracaju — offline</title>
<body style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f4f6f1;color:#19331d;padding:2rem;line-height:1.5">
  <h1 style="font-size:1.3rem">📴 Você está sem conexão</h1>
  <p>O Maracaju não encontrou esta página no cache do aparelho.</p>
  <p>Conecte-se à internet e abra o app novamente.</p>
</body></html>`;

function offlineHtmlResponse() {
  return new Response(OFFLINE_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

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
  './js/benefits.js',
  './js/calendar.js',
  './js/projects.js',
  './js/auth.js',
  './js/storage.js',
  './js/audio.js',
  './js/gamification.js',
  './js/tasks.js',
  './js/shopping.js',
  './js/shopping-items.js',
  './js/catalog.js',
  './js/pdf-parser.js',
  './js/vendor/pdf.min.js',
  './js/vendor/pdf.worker.min.js',
  './js/vendor/jsqr.min.js',
  './js/vendor/tesseract.min.js',
  './js/vendor/tesseract-worker.min.js',
  './js/nfce.js',
  './js/history.js',
  './js/carro.js',
  './js/reformas.js',
  './js/sonhos.js',
  './js/pets.js',
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
        .catch(async () => {
          return (await caches.match('./index.html', { ignoreSearch: true })) ||
                 (await caches.match('./', { ignoreSearch: true })) ||
                 offlineHtmlResponse();
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
        .catch(async () => {
          return (await caches.match(event.request, { ignoreSearch: true })) ||
                 new Response('// Recurso indisponível offline', {
                   status: 504,
                   headers: { 'Content-Type': 'text/javascript; charset=utf-8' }
                 });
        })
    );
    return;
  }

  // 3. Demais assets (ícones, imagens): Cache First, fallback Network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
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
      }).catch(() => new Response('', { status: 504 }));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
