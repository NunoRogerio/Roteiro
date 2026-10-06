// Network first: the roteiro is always the live version; the cache is only for when there is no network.
const CACHE = 'roteiros-v1';
const SHELL = ['./', 'index.html', 'roteiro.json', 'manifest.json', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (sameOrigin && res.ok) {
          const copy = res.clone();
          const key = url.pathname.endsWith('roteiro.json') ? 'roteiro.json' : req;
          caches.open(CACHE).then(c => c.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(url.pathname.endsWith('roteiro.json') ? 'roteiro.json' : req))
  );
});
