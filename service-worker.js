const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'styles.css',
    'scripts.js',
    // Add other URLs to cache
];

// Install event - Cache the files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - Serve cached files
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// Activate event - Clean up old caches
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

// Example progress update
self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_PROGRESS') {
        // Progress calculation placeholder
        const progress = calculateProgress();
        const total = urlsToCache.length;
        event.source.postMessage({
            type: 'CACHE_PROGRESS',
            progress,
            total
        });
    }
});

// Placeholder function for progress calculation
function calculateProgress() {
    // This function should track the actual progress of caching
    // For simplicity, let's assume it's always 100% here
    return urlsToCache.length; // Change this logic to track actual progress
}
