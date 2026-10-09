/* =====================================================================
   APML Portal - service worker
   - Pages: network first (so a new deploy shows up straight away),
            cached copy when offline.
   - CSS / JS / images / fonts: served from cache instantly, refreshed in
            the background.
   - Live data (Firebase, Supabase, Cloudinary, your Workers): never touched.

   To force every visitor to drop old copies after a big change, just bump
   VERSION below (for example 'v2').
   ===================================================================== */
const VERSION = 'v1';
const SHELL_CACHE = 'apml-shell-' + VERSION;
const RUNTIME_CACHE = 'apml-runtime-' + VERSION;
const RUNTIME_MAX_ENTRIES = 120;

// Files saved on install so the portal opens even with no signal.
// A file that does not exist is skipped, it never breaks the install.
const PRECACHE = [
  './',
  'index.html',
  'about.html',
  'APML-Lite.html',
  'car-rate.html',
  'local-rate.html',
  'directory.html',
  'field-officer.html',
  'hub-details.html',
  'editor.html',
  'drive.html',
  'gallery.html',
  'dump.html',
  'common.js',
  'common.css',
  'logo.svg',
  'manifest.json'
];

// Third-party files that are safe to keep (they never hold your data)
function isStaticCdn(url) {
  return url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com' ||
         url.hostname === 'cdn.jsdelivr.net' ||
         url.hostname === 'unpkg.com' ||
         (url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.allSettled(PRECACHE.map(async (path) => {
      const url = new URL(path, self.location.href).href;      // always relative to where sw.js lives
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
    await Promise.all(names.filter((n) => n.indexOf('apml-') === 0 && keep.indexOf(n) === -1).map((n) => caches.delete(n)));
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
  if (req.method !== 'GET') return;                       // saves, uploads, deletes go straight through
  if (req.headers.has('range')) return;                   // video seeking
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.origin === self.location.origin) {
    if (url.pathname.slice(-6) === '/sw.js') return;
    if (req.mode === 'navigate') { event.respondWith(pageStrategy(event)); return; }
    const d = req.destination;
    if (d === 'script' || d === 'style' || d === 'font' || d === 'image' || d === 'manifest') {
      event.respondWith(staleWhileRevalidate(event));
    } else {
      event.respondWith(networkFirst(event));             // JSON and other data files stay fresh
    }
    return;
  }
  if (isStaticCdn(url)) { event.respondWith(staleWhileRevalidate(event)); return; }
  // Firebase, Supabase, Cloudinary, workers.dev ...: not handled here, always live.
});

// ---------- strategies ----------
async function pageStrategy(event) {
  const req = event.request;
  try {
    const res = (await event.preloadResponse) || (await fetch(req));
    if (res && res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.put(req, copy)));
    }
    return res;
  } catch (err) {
    const cached = (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
    if (cached) return cached;
    const home = (await caches.match('index.html')) || (await caches.match('./'));
    return home || offlineResponse();
  }
}

async function networkFirst(event) {
  const req = event.request;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const copy = res.clone();
      event.waitUntil(caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).then(trimRuntime));
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
      return caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).then(trimRuntime).then(() => res);
    }
    return res;
  }).catch(() => null);

  if (cached) { event.waitUntil(refresh); return cached; }   // instant, and updated for next time
  const res = await refresh;
  if (res) return res;
  // offline and this exact URL (e.g. common.js?v=22.4) was never saved: use the plain copy
  const fallback = await caches.match(req, { ignoreSearch: true });
  return fallback || Response.error();
}

async function trimRuntime() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - RUNTIME_MAX_ENTRIES; i++) await cache.delete(keys[i]);
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
