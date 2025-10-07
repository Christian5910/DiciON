const CACHE_NAME = "dicion-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/colorido.css",
  "/javinhas.js",
  "/palavras.json",
  "/assets/qrpix.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

// Instalação do Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Intercepta requisições e tenta responder do cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchRes => {
          // cacheia dinamicamente os novos recursos
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })
  );
});

// Atualiza o cache quando uma nova versão é instalada
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
