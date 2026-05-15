/**
 * Offline / repeat-visit caching for pandjico on GitHub Pages (no server-side Cache-Control).
 *
 * Bump STATIC_CACHE (and optionally RUNTIME_CACHE) whenever you change precached files
 * so clients drop old entries. See README + docs/github-pages.md.
 */
var STATIC_CACHE = "pandjico-static-62";
var RUNTIME_CACHE = "pandjico-runtime-1";

/** Paths relative to the service worker scope (site root). */
var PRECACHE_REL = [
    "index.html",
    "about.html",
    "station.html",
    "contact.html",
    "cv.html",
    "css/styles.css",
    "js/lab-egg.js",
    "js/station-dial.js",
    "js/station-toolbar.js",
    "js/register-sw.js",
    "js/adapt-hero.js",
    "js/cursor-typewriter-chip.js",
    "js/hero-panel-scroll.js",
    "js/cursor-atmosphere.js",
    "js/work-cards.js",
    "js/works-index.js",
    "js/hero-client-blurbs.js",
    "js/frost-tooltip.js",
    "js/station-toolbar.js",
    "js/mobile-home.js",
    "js/contact-form.js",
    "fonts/Ronzino-Regular.woff2",
    "fonts/Ronzino-Oblique.woff2",
    "fonts/Ronzino-Medium.woff2",
    "fonts/Ronzino-MediumOblique.woff2",
    "fonts/Ronzino-Bold.woff2",
    "fonts/Ronzino-BoldOblique.woff2",
    "projects/index.html",
    "projects/projects.json",
    "projects/placeholder-case-study.html",
    "projects/sensory-language.html",
    "projects/adaptive-interfaces.html",
    "projects/tactility-grounding.html",
    "projects/synek-launch.html",
];

function scopeUrl(rel) {
    return new URL(rel, self.registration.scope).href;
}

function isLargeMedia(url) {
    return /\.(mp4|mov|m4v|webm)$/i.test(url.pathname);
}

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(function (cache) {
                return Promise.all(
                    PRECACHE_REL.map(function (rel) {
                        return cache.add(scopeUrl(rel)).catch(function () {
                            /* precache best-effort; missing optional assets must not fail install */
                        });
                    }),
                );
            })
            .then(function () {
                return self.skipWaiting();
            }),
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches
            .keys()
            .then(function (keys) {
                return Promise.all(
                    keys.map(function (key) {
                        if (key === STATIC_CACHE || key === RUNTIME_CACHE) {
                            return Promise.resolve();
                        }
                        if (key.indexOf("pandjico-") === 0) {
                            return caches.delete(key);
                        }
                        return Promise.resolve();
                    }),
                );
            })
            .then(function () {
                return self.clients.claim();
            }),
    );
});

self.addEventListener("fetch", function (event) {
    var req = event.request;
    if (req.method !== "GET") {
        return;
    }

    var url = new URL(req.url);
    if (url.origin !== self.location.origin) {
        return;
    }
    if (isLargeMedia(url)) {
        return;
    }

    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then(function (res) {
                    return res;
                })
                .catch(function () {
                    return caches.match(req).then(function (hit) {
                        if (hit) {
                            return hit;
                        }
                        return caches.match(scopeUrl("index.html"));
                    });
                }),
        );
        return;
    }

    event.respondWith(
        caches.match(req).then(function (hit) {
            if (hit) {
                return hit;
            }
            return fetch(req).then(function (res) {
                if (res && res.ok && res.type === "basic") {
                    var copy = res.clone();
                    caches.open(RUNTIME_CACHE).then(function (cache) {
                        cache.put(req, copy);
                    });
                }
                return res;
            });
        }),
    );
});
