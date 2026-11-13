/* =====================================================================
   APML Portal - service worker
   - Pages: network first, with a short wait before using a saved page.
   - CSS / JS / images / fonts: cache first, refresh in the background.
   - Live data (Firebase, Supabase, Cloudinary, your Workers): never touched.

   Bump VERSION after changing cache behaviour or the offline shell.
   ===================================================================== */
const VERSION = 'v86';
const SHELL_CACHE = 'apml-shell-' + VERSION;
const RUNTIME_CACHE = 'apml-runtime-' + VERSION;
const RUNTIME_MAX_ENTRIES = 120;
const NAVIGATION_TIMEOUT_MS = 2500;

// Files saved on install so the portal opens even with no signal.
// Missing files are skipped and never break installation.
const PRECACHE = [
  './',
  'index.html',
  'about.html',
  'modules/APML-Lite.html',
  'modules/car-rate.html',
  'modules/local-rate.html',
  'modules/directory.html',
  'modules/directory.js',
  'modules/field-officer.html',
  'modules/field-officer.js',
  'modules/editor.html',
  'modules/drive.html',
  'modules/gallery.html',
  'policy/bug-report.html',
  'policy/privacy.html',
  'policy/cookies.html',
  'policy/terms.html',
  '404.html',
  'modules/analytics.html',
  'modules/system-health.html',
  'core/common.js',
  'core/visitor-tracker.js',
  'core/visitor-analytics.js',
  'core/performance-analytics.js',
  'notify.js',
  'core/common.css',
  'core/header.html',
  'core/footer.html',
  'logo.svg',
  'icon-192.png',
  'icon-512.png',
  'manifest.json'
];

// Only public, versioned/static assets are cached cross-origin.
// Firebase, Supabase, Cloudinary and Worker/API traffic stays live.
function isStaticCdn(url) {
  return url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com' ||
         url.hostname === 'cdn.jsdelivr.net' ||
         url.hostname === 'releases.transloadit.com' ||
         url.hostname === 'cdnjs.cloudflare.com' ||
         url.hostname === 'unpkg.com' ||
         url.hostname === '3dicons.sgp1.cdn.digitaloceanspaces.com' ||
         url.hostname === 'koboyo.com' ||
         url.hostname === 'www.koboyo.com' ||
         (url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.allSettled(PRECACHE.map(async (path) => {
      const url = new URL(path, self.location.href).href;
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (res.ok) await cache.put(url, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, RUNTIME_CACHE];
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.indexOf('apml-') === 0 && keep.indexOf(name) === -1)
      .map((name) => caches.delete(name)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('/sw.js')) return;
    if (req.mode === 'navigate') {
      event.respondWith(pageStrategy(event));
      return;
    }
    const destination = req.destination;
    if (destination === 'script' || destination === 'style' ||
        destination === 'font' || destination === 'image' ||
        destination === 'manifest') {
      event.respondWith(staleWhileRevalidate(event));
    } else {
      event.respondWith(networkFirst(event));
    }
    return;
  }

  if (isStaticCdn(url)) event.respondWith(staleWhileRevalidate(event));
});

// ---------- strategies ----------
async function pageStrategy(event) {
  const req = event.request;
  const network = Promise.resolve(event.preloadResponse)
    .then((preloaded) => preloaded || fetch(req))
    .then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        return caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy)).then(() => res);
      }
      return res;
    });

  // Keep the network update alive even when a cached page wins the race.
  event.waitUntil(network.catch(() => undefined));

  try {
    const firstResponse = await Promise.race([
      network,
      new Promise((resolve) => setTimeout(() => resolve(null), NAVIGATION_TIMEOUT_MS))
    ]);
    if (firstResponse) return firstResponse;

    const cached = (await caches.match(req)) ||
                   (await caches.match(req, { ignoreSearch: true }));
    if (cached) return cached;

    // First visit: no cached page exists, so wait for the network normally.
    const lateResponse = await network;
    if (lateResponse) return lateResponse;
  } catch (err) {
    const cached = (await caches.match(req)) ||
                   (await caches.match(req, { ignoreSearch: true }));
    if (cached) return cached;
  }

  const home = (await caches.match('index.html')) || (await caches.match('./'));
  return home || offlineResponse();
}

async function networkFirst(event) {
  const req = event.request;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(RUNTIME_CACHE)
        .then((cache) => cache.put(req, copy))
        .then(trimRuntime));
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(event) {
  const req = event.request;
  const cached = await caches.match(req);
  const refresh = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      return caches.open(RUNTIME_CACHE)
        .then((cache) => cache.put(req, copy))
        .then(trimRuntime)
        .then(() => res);
    }
    return res;
  }).catch(() => null);

  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  const res = await refresh;
  if (res) return res;
  const fallback = await caches.match(req, { ignoreSearch: true });
  return fallback || Response.error();
}

async function trimRuntime() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - RUNTIME_MAX_ENTRIES; i++) {
    await cache.delete(keys[i]);
  }
}

function offlineResponse() {
  return new Response(
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Offline | APML Portal</title><style>body{font-family:system-ui,sans-serif;background:#F8F5F0;color:#1C1917;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:24px}' +
    'h1{font-size:22px;margin:0 0 8px}p{color:#78716C;font-size:14px;margin:0 0 16px}button{background:#b91c1c;color:#fff;border:0;border-radius:999px;padding:10px 20px;font-weight:700;cursor:pointer}</style></head>' +
    '<body><div><h1>You are offline</h1><p>This page has not been saved on this device yet. Reconnect and try again.</p><button onclick="location.reload()">Try again</button></div></body></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
