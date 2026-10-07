/* Samvedna service worker — offline-first for app shell + stale-while-revalidate for GET /api */
const CACHE_SHELL = "samvedna-shell-v2";
const CACHE_API = "samvedna-api-v2";

const SHELL = [
    "/",
    "/manifest.json",
];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE_SHELL).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_SHELL && k !== CACHE_API).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url);
    // Only GETs
    if (e.request.method !== "GET") return;

    // Never intercept external domains or websockets
    if (url.origin !== self.location.origin && !url.pathname.startsWith("/api")) return;

    // API: stale-while-revalidate for /api/support-directory and /api/cases
    if (url.pathname.startsWith("/api/")) {
        if (url.pathname.includes("/support-directory") || url.pathname === "/api/cases") {
            e.respondWith(
                caches.open(CACHE_API).then(async (cache) => {
                    const cached = await cache.match(e.request);
                    const fetchP = fetch(e.request).then((res) => {
                        if (res && res.ok) cache.put(e.request, res.clone());
                        return res;
                    }).catch(() => cached);
                    return cached || fetchP;
                })
            );
        }
        return;
    }

    // App shell: cache-first with network fallback
    e.respondWith(
        caches.match(e.request).then((cached) =>
            cached ||
            fetch(e.request).then((res) => {
                if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
                    const copy = res.clone();
                    caches.open(CACHE_SHELL).then((c) => c.put(e.request, copy));
                }
                return res;
            }).catch(() => caches.match("/"))
        )
    );
});
