// Service worker mínimo: permite instalar o app no celular e abrir sem internet.
// Sempre tenta a rede primeiro (para receber versões novas) e só usa o cache se estiver offline.
// Não intercepta a API do GitHub (outra origem): os dados nunca ficam neste cache.
const CACHE = 'central-acoes-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png'])).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request.mode === 'navigate' ? './index.html' : e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request.mode === 'navigate' ? './index.html' : e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
