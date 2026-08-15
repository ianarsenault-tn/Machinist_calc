const APP_VERSION = "3.1.0";
const CACHE = `marcos-calc-v${APP_VERSION}`;
const PRECACHE = ["./", "./index.html", "./calc-core.js", "./favicon.png", "./manifest.json", "./tests.html", "./assets/fonts/ibm-plex-sans-latin.woff2", "./assets/fonts/roboto-slab-700-latin.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  // Do NOT auto skipWaiting. The page offers the user a "Reload" toast that
  // posts {type: "SKIP_WAITING"} when accepted — this avoids pulling the rug
  // out from a user mid-calculation when a new version is deployed.
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (e.data && e.data.type === "GET_VERSION" && e.source) {
    e.source.postMessage({ type: "APP_VERSION", version: APP_VERSION });
  }
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response.ok) {
            const pathname = new URL(e.request.url).pathname;
            const requestCopy = response.clone();
            const fallbackCopy = response.clone();
            caches.open(CACHE).then((cache) => {
              cache.put(e.request, requestCopy);
              if (pathname.endsWith("/") || pathname.endsWith("/index.html")) cache.put("./index.html", fallbackCopy);
            });
          }
          return response;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE).then((c) => c.put(e.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
