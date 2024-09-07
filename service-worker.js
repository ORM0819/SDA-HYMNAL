const CACHE_NAME = 'pwa-cache-v2';
const urlsToCache = [
  '/SDA-HYMNAL/',
  '/SDA-HYMNAL/index.html',
  '/SDA-HYMNAL/image.html',
  '/SDA-HYMNAL/lyrics.html',
  '/SDA-HYMNAL/styles.css',
  '/SDA-HYMNAL/scripts.js',
  '/SDA-HYMNAL/manifest.json',
  '/SDA-HYMNAL/service-worker.js',
  '/SDA-HYMNAL/song_mapping.json',
  '/SDA-HYMNAL/songs.json',
  '/SDA-HYMNAL/songs_es.json',
  '/SDA-HYMNAL/start-cycle-lyrics.html',
  '/SDA-HYMNAL/start-cycle.html',
  '/SDA-HYMNAL/auto-cycle.html',
  '/SDA-HYMNAL/download.html'
  // Add essential static assets here
];

// Install event to cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All essential files are cached.');
      })
      .catch((error) => {
        console.error('Failed to cache files during install:', error);
      })
  );
});

// Fetch event to handle caching and updating
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the request is for download.html, update cached files
  if (url.pathname.includes('/SDA-HYMNAL/download')) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Updating cached files...');
          return Promise.all(
            urlsToCache.map((urlToCache) => {
              return fetch(urlToCache)
                .then((response) => {
                  if (response.ok) {
                    cache.put(urlToCache, response.clone());
                  }
                })
                .catch((error) => {
                  console.error(`Failed to fetch and update ${urlToCache}:`, error);
                });
            })
          ).then(() => {
            // Fetch the updated download.html
            return fetch(event.request);
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log(`Serving ${event.request.url} from cache.`);
            return response;
          }
          console.log(`Fetching ${event.request.url} from network.`);
          return fetch(event.request)
            .then((fetchedResponse) => {
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchedResponse.clone());
                  return fetchedResponse;
                });
            });
        })
    );
  }
});

// Activate event to manage old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
