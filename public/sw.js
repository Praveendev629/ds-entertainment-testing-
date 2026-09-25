/* DS Entertainment Zone service worker */
const VERSION = "v1";
const PAGES_CACHE = `ds-pages-${VERSION}`;
const STATIC_CACHE = `ds-static-${VERSION}`;
const MEDIA_CACHE = `ds-media-${VERSION}`;
const KEEP_CACHES = [PAGES_CACHE, STATIC_CACHE, MEDIA_CACHE];

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/admin-manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Offline</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050505;color:#fff;font-family:system-ui,-apple-system,sans-serif}
  .card{max-width:22rem;padding:2rem;text-align:center}
  h1{font-size:1.25rem;margin:0 0 .5rem}
  p{color:#71717a;font-size:.9rem;line-height:1.6;margin:0 0 1.25rem}
  button{width:100%;padding:.875rem;border:0;border-radius:1rem;background:#db2777;color:#fff;font-weight:700;font-size:.875rem;cursor:pointer}
</style>
</head>
<body>
  <div class="card">
    <h1>You are offline</h1>
    <p>No internet connection. Check your network and try again.</p>
    <button onclick="location.reload()">Try again</button>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: "reload" }).then((res) => {
              if (res && res.ok) return cache.put(url, res);
              return undefined;
            })
          )
        )
      )
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !KEEP_CACHES.includes(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Service worker script and Supabase (live user data) always hit the network.
  if (url.pathname === "/sw.js") return;
  if (url.hostname.endsWith(".supabase.co") || url.hostname.endsWith(".supabase.in")) return;

  // Never serve cached API responses - admin/user data must stay fresh.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/media/") ||
    url.pathname === "/ds-logo.png";

  const isMedia =
    request.destination === "image" ||
    request.destination === "font" ||
    /\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm|mp3)$/.test(url.pathname);

  if (isStatic || isMedia) {
    event.respondWith(cacheFirst(request, isStatic ? STATIC_CACHE : MEDIA_CACHE));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque") && response.status !== 206) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      return new Response(OFFLINE_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    return new Response("", { status: 504, statusText: "Offline" });
  }
}
