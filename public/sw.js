const CACHE_NAME = 'huizzzi-cache-v1';
const IMAGE_CACHE_NAME = 'huizzzi-images-v1';

// COS domains to cache
const COS_DOMAINS = [
  'photo-1392627581.cos.ap-beijing.myqcloud.com',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Images & videos: Cache First — serve from cache, update in background
  image: async (request) => {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      // Return cached version immediately
      // Refresh cache in background
      fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
      return cached;
    }

    // Not in cache — fetch and store
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  },

  // Static assets (JS/CSS/HTML): Stale While Revalidate
  static: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);

    return cached || networkPromise;
  },
};

function isCosMedia(request) {
  const url = new URL(request.url);
  const isCos = COS_DOMAINS.some((domain) => url.hostname.includes(domain));
  const isMedia = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)(\?.*)?$/i.test(url.pathname);
  return isCos && isMedia;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|html|svg|ico|json)(\?.*)?$/i.test(url.pathname);
}

// Install: pre-cache critical static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/about/',
        '/series/',
      ]).catch(() => {});
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: route requests to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  if (isCosMedia(request)) {
    event.respondWith(CACHE_STRATEGIES.image(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(CACHE_STRATEGIES.static(request));
  }
});
