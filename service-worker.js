const CACHE_NAME = 'sda-hymnal-cache-v1';
const baseUrlsToCache = [
    '/',
    '/index.html',
    '/start-cycle.html',
    '/start-cycle-lyrics.html',
    '/styles.css',
    '/scripts.js',
    '/manifest.json',
    '/songs.json',
    '/songs_es.json',
    '/song_mapping.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            let total = 0;
            let progress = 0;

            function updateProgress() {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'CACHE_PROGRESS',
                            progress,
                            total
                        });
                    });
                });
            }

            return Promise.all([
                cache.addAll(baseUrlsToCache),
                fetch('/songs.json')
                    .then(response => response.json())
                    .then(songs => {
                        const songUrls = songs.map(song => [
                            `/image.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&image=${encodeURIComponent(song.image)}`,
                            `/lyrics.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&content=${encodeURIComponent(song.content)}`
                        ]).flat();
                        total += songUrls.length;
                        return songUrls.reduce((promise, url) => {
                            return promise.then(() => {
                                return cache.add(url).then(() => {
                                    progress++;
                                    updateProgress();
                                });
                            });
                        }, Promise.resolve());
                    }),
                fetch('/songs_es.json')
                    .then(response => response.json())
                    .then(songs => {
                        const songUrls = songs.map(song => [
                            `/image.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&image=${encodeURIComponent(song.image)}`,
                            `/lyrics.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&content=${encodeURIComponent(song.content)}`
                        ]).flat();
                        total += songUrls.length;
                        return songUrls.reduce((promise, url) => {
                            return promise.then(() => {
                                return cache.add(url).then(() => {
                                    progress++;
                                    updateProgress();
                                });
                            });
                        }, Promise.resolve());
                    })
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
