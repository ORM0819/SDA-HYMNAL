const CACHE_NAME = 'sda-hymnal-cache-v1';
const URLS_TO_CACHE = [
    '/',
    'index.html',
    'image.html',
    'styles.css',
    'manifest.json',
    'songs.json' // Add your JSON file to the cache list
];

// Function to fetch the JSON and cache images
async function cacheImages() {
    const response = await fetch('songs.json');
    const songs = await response.json();
    const imageUrls = songs.map(song => `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`);
    
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(imageUrls);
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
            .then(() => {
                return cacheImages();
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
