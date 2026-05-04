const CACHE_NAME = "letra-ai-v1";
const urlsToCache = [
  "/",
  "/login",
  "/dashboard",
  "/schedule",
  "/manifest.json",
  "/brand/letra-ai-icon.png",
];

// Instalação: Cacheia assets estáticos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições que não sejam GET ou de APIs externas (ex: YouTube)
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache dinâmico para arquivos do Next.js (_next/static), imagens e fontes
        if (
          url.pathname.startsWith("/_next/static/") ||
          url.pathname.startsWith("/brand/") ||
          request.destination === "font"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback offline para navegação: se falhar a rede e não houver cache, volta para o /
        if (request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});
