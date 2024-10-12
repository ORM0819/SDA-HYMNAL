const MAJOR_VERSION = '4';  // Change this for major version updates
const MINOR_VERSION = '0';  // Change this for minor version updates

const MAJOR_CACHE = `pwa-cache-major-v${MAJOR_VERSION}`;
const MINOR_CACHE = `pwa-cache-minor-v${MAJOR_VERSION}.${MINOR_VERSION}`;

// URLs to cache for minor updates (essential static assets)
const urlsToCacheMinor = [
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

// Install event to handle both major and minor caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Cache only the essential assets in the minor cache during installation
    caches.open(MINOR_CACHE).then((cache) => {
      console.log('Caching minor files...');
      return cache.addAll(urlsToCacheMinor);
    })
  );
});

// Fetch event to handle caching of any file and updating essential files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Try to match the request in the major cache first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`Serving ${event.request.url} from cache.`);
        return cachedResponse;
      }

      // Fetch from network if not cached and add to the major cache
      return fetch(event.request).then((networkResponse) => {
        return caches.open(MAJOR_CACHE).then((cache) => {
          console.log(`Caching ${event.request.url} in the major cache.`);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// Activate event to manage cache versions
self.addEventListener('activate', (event) => {
  const majorCacheWhitelist = [MAJOR_CACHE];
  const minorCacheWhitelist = [MINOR_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old major caches on a major version update
          if (!majorCacheWhitelist.includes(cacheName) && cacheName.startsWith('pwa-cache-major')) {
            console.log(`Deleting old major cache: ${cacheName}`);
            return caches.delete(cacheName);
          }

          // Delete old minor caches on a minor version update
          if (!minorCacheWhitelist.includes(cacheName) && cacheName.startsWith('pwa-cache-minor')) {
            console.log(`Deleting old minor cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
