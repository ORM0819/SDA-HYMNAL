const CACHE_NAME = 'sda-hymnal-cache-v1';
const URLS_TO_CACHE = [
    '/',
    'index.html',
    'start-cycle.html',
    'image.html',
    'styles.css',
    'manifest.json',
    'songs.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
            .then(() => {
                // Fetch and cache the songs data
                fetch('songs.json')
                    .then(response => response.json())
                    .then(songs => {
                        const imageUrls = songs.map(song => `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`);
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                return cache.addAll(imageUrls);
                            });
                    });
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((networkResponse) => {
                    // Cache the new response
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
    );
});

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
