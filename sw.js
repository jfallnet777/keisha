// Permite abrir la app sin internet después de la primera visita.
const CACHE = "keisha-dl-v21";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192-v3.png", "./icon-512-v3.png", "./icon-maskable-512-v3.png", "./apple-touch-icon.png", "./apple-touch-icon-180.png", "./apple-touch-icon-167.png", "./apple-touch-icon-152.png", "./favicon-v3.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // La app: primero internet (para recibir actualizaciones), si no hay, la copia guardada
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
  } else if (/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    // Librerías de PDF/Excel y fuentes: se guardan para usarlas sin internet
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })));
  }
});
