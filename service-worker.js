const CACHE_NAME = 'sda-hymnal-cache-v1';
const URLS_TO_CACHE = [
    '/',
    'index.html',
    'image.html',
    'styles.css',
    'manifest.json',
    'src/Hymnal.XF/Resources/Assets/MusicSheets/' // Make sure to include the path where your images are stored
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Fetch Event
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

// Activate Event
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

// Handle messages from the main script to cache images
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_IMAGES') {
        const imageUrls = event.data.imageUrls;
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(imageUrls);
        }).then(() => {
            console.log('Cached images:', imageUrls);
        });
    }
});
