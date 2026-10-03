// Offline reading. The app's own files come from the network when it is there, so a new version shows up at
// once, and from the cache when it is not. Bible data (data/) rarely changes: it comes from the cache first and
// is refreshed in the background. "Save for offline" (app.js) fills the same data cache with the whole Bible.
// The atlas map is another site and is not kept; offline, the context panel falls back to its drawn map.

const SHELL = "bible-shell-v1", DATA = "bible-data", FONTS = "bible-fonts";
const SHELL_FILES = ["./", "app.js", "style.css", "manifest.webmanifest", "img/logo.svg", "img/logo-white.svg",
  "img/favicon.svg", "img/icon-32.png", "img/icon-180.png", "img/icon-192.png", "data/books.json", "atlas/tours.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  const keep = [SHELL, DATA, FONTS];
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const scope = new URL(self.registration.scope);
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin === scope.origin) {
    if (req.mode === "navigate") e.respondWith(networkFirst(req, SHELL, new URL("./", scope)));
    else if (url.pathname.startsWith(scope.pathname + "data/")) e.respondWith(cacheFirst(req, DATA, true));
    else e.respondWith(networkFirst(req, SHELL));
  } else if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(cacheFirst(req, FONTS, false));
  }
});

async function networkFirst(req, name, fallback) {
  const cache = await caches.open(name);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(fallback || req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(fallback || req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}
async function cacheFirst(req, name, refresh) {
  const cache = await caches.open(name);
  const hit = await cache.match(req, { ignoreSearch: true });
  const update = fetch(req).then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; });
  if (hit) { if (refresh) update.catch(() => {}); return hit; }
  return update;
}
