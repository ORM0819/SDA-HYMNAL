const CACHE_NAME = 'pwa-cache-v1';
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
  '/SDA-HYMNAL/start-cycle.html'
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

// Fetch event to cache dynamic requests (like images and pages with query parameters)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/SDA-HYMNAL/image.html') || url.pathname.startsWith('/SDA-HYMNAL/lyrics.html')) {
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
