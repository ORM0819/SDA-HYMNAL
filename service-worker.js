const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'styles.css',
    'scripts.js',
    // Add other URLs to cache
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Example progress update (this is just a basic example; actual implementation will vary)
self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_PROGRESS') {
        const progress = calculateProgress(); // Implement your logic to calculate progress
        const total = urlsToCache.length; // Example total, adjust as needed
        event.source.postMessage({
            type: 'CACHE_PROGRESS',
            progress,
            total
        });
    }
});
