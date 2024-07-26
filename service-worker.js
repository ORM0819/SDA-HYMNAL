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
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event to cache dynamic requests (like images and pages with query parameters)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle caching for dynamic pages (like image.html with query parameters)
  if (url.pathname.startsWith('/SDA-HYMNAL/image.html') || url.pathname.startsWith('/SDA-HYMNAL/lyrics.html')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response; // Return cached response if available
          }
          return fetch(event.request)
            .then((fetchedResponse) => {
              // Cache the fetched response for future use
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchedResponse.clone());
                  return fetchedResponse;
                });
            });
        })
    );
  } else {
    // Handle caching for other requests
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response; // Return cached response if available
          }
          return fetch(event.request)
            .then((fetchedResponse) => {
              // Cache the fetched response for future use
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
