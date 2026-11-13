const CACHE_NAME = 'radhika-it-college-v2';
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json',
    '/images/app-icon-192.png',
    '/images/app-icon-512.png',
    '/images/app-icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('radhika-it-college-') && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin ||
        requestUrl.pathname.startsWith('/api/')) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const responseCopy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseCopy));
                    }
                    return response;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const responseCopy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
                }
                return response;
            });
        })
    );
});
