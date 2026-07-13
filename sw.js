const STATIC_CACHE = "web3-static-v1.0.0";
const DYNAMIC_CACHE = "web3-dynamic-v1.0.0";

const STATIC_ASSETS = [
    "./index.html",
    "./manifest.json",
    "./css/main.css",
    "./js/utils.js",
    "./js/config.js",
    "./js/api.js",
    "./js/app.js",
    "./js/router.js",
    "./js/theme.js",
    "./js/content-loader.js",
    "./js/search.js",
    "./js/filter-sort.js",
    "./js/player-init.js",
    "./js/carousel-init.js",
    "./js/animations.js",
    "./js/sidebar.js",
    "./js/pwa.js",
    "./pages/home.html",
    "./pages/category.html",
    "./pages/genres.html",
    "./pages/archived.html",
    "./pages/about.html",
    "./pages/player.html",
    "./partials/navbar.html",
    "./partials/sidebar.html",
    "./partials/footer.html",
    "./partials/card-item.html",
    "./partials/filter-bar.html",
    "./partials/empty-state.html",
    "./partials/error-state.html",
    "./partials/install-banner.html",
    "./assets/images/posters/default-poster.svg",
    "./assets/images/banners/default-banner.svg",
    "./assets/images/misc/no-results.svg",
    "./assets/logo/logo.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = event.request.url;

    if (url.includes("/video/")) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (url.includes("/api/")) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            return (
                cached ||
                fetch(event.request).then((res) => {
                    const clone = res.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
                    return res;
                })
            );
        })
    );
});
