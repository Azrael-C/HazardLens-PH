const SHELL_CACHE = "hazardlens-shell-v1";
const RUNTIME_CACHE = "hazardlens-runtime-v1";
const TILE_CACHE = "hazardlens-tiles-v1";
const SHELL = ["/", "/explorer", "/earthquakes", "/methodology", "/offline", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url)))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const current = new Set([SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !current.has(key)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

async function trimCache(name, limit) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match("/offline"));
  }
}

async function cacheTile(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    await trimCache(TILE_CACHE, 160);
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate" || url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.hostname === "tile.openstreetmap.org" || url.hostname.endsWith("rainviewer.com") || url.hostname.endsWith("earthdata.nasa.gov")) {
    event.respondWith(cacheTile(request));
  }
});
