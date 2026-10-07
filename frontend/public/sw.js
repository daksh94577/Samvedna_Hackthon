/* Samvedna service worker — offline-first app shell + web push */
const CACHE_SHELL = "samvedna-shell-v3";
const CACHE_API = "samvedna-api-v3";

const SHELL = ["/", "/manifest.json"];

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
    if (e.request.method !== "GET") return;
    if (url.origin !== self.location.origin && !url.pathname.startsWith("/api")) return;

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

/* --- Web Push --- */
self.addEventListener("push", (event) => {
    let data = { title: "Samvedna", body: "You have a new notification.", url: "/" };
    try {
        if (event.data) data = { ...data, ...event.data.json() };
    } catch (_) { /* keep defaults */ }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: data.tag || "samvedna",
            data: { url: data.url },
            vibrate: [200, 80, 200],
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const target = (event.notification.data && event.notification.data.url) || "/";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
            for (const w of wins) {
                if (w.url.endsWith(target) && "focus" in w) return w.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow(target);
        })
    );
});
