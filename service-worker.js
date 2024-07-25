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
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const songUrls = await getAllSongUrls();

            const totalUrls = baseUrlsToCache.length + songUrls.length;
            let cachedCount = 0;

            const updateProgress = () => {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({
                        type: 'CACHE_PROGRESS',
                        progress: ++cachedCount,
                        total: totalUrls
                    }));
                });
            };

            for (const url of [...baseUrlsToCache, ...songUrls]) {
                try {
                    await cache.add(url);
                    updateProgress();
                } catch (error) {
                    console.error(`Failed to cache ${url}:`, error);
                }
            }
        })()
    );
});

async function getAllSongUrls() {
    const songUrls = [];

    const addSongUrls = async (songsJson) => {
        const response = await fetch(songsJson);
        const songs = await response.json();
        songs.forEach(song => {
            songUrls.push(`/image.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&image=${encodeURIComponent(song.image)}`);
            songUrls.push(`/lyrics.html?title=${encodeURIComponent(song.title)}&number=${encodeURIComponent(song.number)}&content=${encodeURIComponent(song.content)}`);
        });
    };

    await addSongUrls('/songs.json');
    await addSongUrls('/songs_es.json');

    return songUrls;
}

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(response => {
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
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
