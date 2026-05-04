/**
 * FolkUp Quest — Enhanced Service Worker
 * FQST-013 Phase 3: Multi-tier caching strategy for responsive images
 * Enhanced Alice v2.0 Level 3 Cartouche Autonome
 */

const CACHE_VERSION = 'fqst-v1.0-20260504';
const ASSET_CACHE = 'fqst-assets-v1.0';

// Critical assets for precaching
const PRECACHE_URLS = [
  '/',
  '/story.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/fonts/fonts.css',
  '/styles/_scenes.css',
  '/legal/privacy.html',
  '/legal/terms.html',
  '/legal/cookies.html',
];

// Cache strategy patterns
const CACHE_STRATEGIES = {
  images: {
    // Thumbnails: aggressive caching (gallery performance)
    thumbnails: /\/comic\/panels\/.*-thumb\.(webp|png)$/,

    // Medium variants: network-first with cache fallback
    medium: /\/comic\/panels\/.*-medium\.(webp|png)$/,

    // Full variants: network-first with timeout
    full: /\/comic\/panels\/.*-full\.(webp|png)$/,

    // Manifests: stale-while-revalidate
    manifests: /\/comic\/panels\/.*-manifest\.json$/,

    // Legacy generated images: cache-first
    legacy: /\/comic\/panels\/.*-generated\.png$/
  },
  critical: {
    // Core app assets
    core: /\/(story\.json|manifest\.webmanifest|favicon\.svg)$/,

    // Stylesheets and fonts
    styles: /\/(styles\/.*\.css|fonts\/.*\.(woff2|woff|ttf))$/,

    // Legal documents
    legal: /\/legal\/.*\.html$/
  }
};

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_VERSION).then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      }),
      caches.open(ASSET_CACHE)
    ])
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Route to appropriate caching strategy
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  const pathname = url.pathname;

  try {
    // Strategy 1: Thumbnails (aggressive cache for gallery performance)
    if (CACHE_STRATEGIES.images.thumbnails.test(pathname)) {
      return handleThumbnailRequest(request);
    }

    // Strategy 2: Medium variants (network-first with cache fallback)
    if (CACHE_STRATEGIES.images.medium.test(pathname)) {
      return handleMediumRequest(request);
    }

    // Strategy 3: Full variants (network-first with timeout fallback)
    if (CACHE_STRATEGIES.images.full.test(pathname)) {
      return handleFullImageRequest(request);
    }

    // Strategy 4: Manifests (stale-while-revalidate)
    if (CACHE_STRATEGIES.images.manifests.test(pathname)) {
      return handleManifestRequest(request);
    }

    // Strategy 5: Legacy images (cache-first for backwards compatibility)
    if (CACHE_STRATEGIES.images.legacy.test(pathname)) {
      return handleLegacyImageRequest(request);
    }

    // Strategy 6: Core app assets (cache-first with background update)
    if (CACHE_STRATEGIES.critical.core.test(pathname) ||
        CACHE_STRATEGIES.critical.styles.test(pathname) ||
        CACHE_STRATEGIES.critical.legal.test(pathname)) {
      return handleCoreAssetRequest(request);
    }

    // Default: network-first for other assets
    return handleDefaultRequest(request);

  } catch (error) {
    console.error('Service worker error:', error);
    return handleDefaultRequest(request);
  }
}

// Thumbnails: aggressive caching for gallery performance
async function handleThumbnailRequest(request) {
  const cached = await caches.match(request);

  if (cached) {
    // Track cache hit for performance analytics
    notifyClients({ type: 'cache-hit', resource: 'thumbnail' });
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
      notifyClients({ type: 'cache-miss', resource: 'thumbnail' });
    }

    return response;

  } catch (error) {
    // Return placeholder for failed thumbnails
    return createThumbnailPlaceholder();
  }
}

// Medium variants: network-first with cache fallback
async function handleMediumRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
      return response;
    }

  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      notifyClients({ type: 'cache-fallback', resource: 'medium' });
      return cached;
    }
  }

  // Both network and cache failed, try thumbnail fallback
  return tryThumbnailFallback(request);
}

// Full variants: network-first with 3s timeout
async function handleFullImageRequest(request) {
  try {
    // Race between network and timeout
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]);

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
      return response;
    }

  } catch (error) {
    // Timeout or network failure: try medium variant fallback
    const mediumUrl = request.url.replace('-full.', '-medium.');
    const mediumRequest = new Request(mediumUrl, request);

    const mediumResponse = await caches.match(mediumRequest);
    if (mediumResponse) {
      notifyClients({ type: 'fallback', from: 'full', to: 'medium' });
      return mediumResponse;
    }

    // Last resort: try cached full image
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
  }

  // Ultimate fallback: thumbnail
  return tryThumbnailFallback(request);
}

// Manifests: stale-while-revalidate
async function handleManifestRequest(request) {
  const cached = await caches.match(request);

  // Return cached version immediately if available
  if (cached) {
    // Update in background
    fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(ASSET_CACHE);
        await cache.put(request, response);
      }
    }).catch(() => {});

    return cached;
  }

  // No cache: fetch from network
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    // Return minimal fallback manifest
    return createFallbackManifest(request.url);
  }
}

// Legacy images: cache-first for backwards compatibility
async function handleLegacyImageRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    return new Response('Image not found', { status: 404 });
  }
}

// Core assets: cache-first with background update
async function handleCoreAssetRequest(request) {
  const cached = await caches.match(request);

  if (cached) {
    // Background update for HTML/JSON files
    if (request.url.endsWith('.html') || request.url.endsWith('.json') ||
        request.url.endsWith('/')) {
      fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response);
        }
      }).catch(() => {});
    }

    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    // Navigation fallback
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    return new Response('Asset not available', { status: 404 });
  }
}

// Default: network-first
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);
    return response;

  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Not available offline', { status: 404 });
  }
}

// Fallback utilities
async function tryThumbnailFallback(request) {
  const thumbnailUrl = request.url
    .replace('-medium.', '-thumb.')
    .replace('-full.', '-thumb.');

  const thumbnailRequest = new Request(thumbnailUrl, request);
  const thumbnail = await caches.match(thumbnailRequest);

  if (thumbnail) {
    notifyClients({ type: 'fallback', to: 'thumbnail' });
    return thumbnail;
  }

  return createThumbnailPlaceholder();
}

function createThumbnailPlaceholder() {
  const svg = `
    <svg width="100" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#999" font-size="8">
        Panel Loading...
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

function createFallbackManifest(url) {
  const panelId = url.match(/panel-[\d.]+/)?.[0] || 'unknown';

  const fallbackManifest = {
    panelId,
    generated: new Date().toISOString(),
    status: 'offline',
    variants: {
      thumb: { webp: '', png: '', width: 100, height: 150 },
      medium: { webp: '', png: '', width: 512, height: 768 },
      full: { webp: '', png: '', width: 1024, height: 1536 }
    }
  };

  return new Response(JSON.stringify(fallbackManifest), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// Performance analytics integration
function notifyClients(data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'sw-performance',
        data: {
          timestamp: Date.now(),
          ...data
        }
      });
    });
  });
}

// Cache management API for debugging
self.addEventListener('message', async (event) => {
  const { action, data } = event.data;

  switch (action) {
    case 'get-cache-stats':
      const stats = await getCacheStats();
      event.ports[0].postMessage(stats);
      break;

    case 'clear-asset-cache':
      await caches.delete(ASSET_CACHE);
      await caches.open(ASSET_CACHE);
      event.ports[0].postMessage({ success: true });
      break;

    case 'precache-thumbnails':
      await precacheThumbnails(data.panelIds);
      event.ports[0].postMessage({ success: true });
      break;
  }
});

async function getCacheStats() {
  const [coreCache, assetCache] = await Promise.all([
    caches.open(CACHE_VERSION),
    caches.open(ASSET_CACHE)
  ]);

  const [coreKeys, assetKeys] = await Promise.all([
    coreCache.keys(),
    assetCache.keys()
  ]);

  return {
    version: CACHE_VERSION,
    coreAssets: coreKeys.length,
    cachedAssets: assetKeys.length,
    thumbnails: assetKeys.filter(req => req.url.includes('-thumb')).length,
    mediumVariants: assetKeys.filter(req => req.url.includes('-medium')).length,
    fullVariants: assetKeys.filter(req => req.url.includes('-full')).length
  };
}

async function precacheThumbnails(panelIds) {
  const cache = await caches.open(ASSET_CACHE);

  for (const panelId of panelIds) {
    try {
      const webpUrl = `/comic/panels/${panelId}-thumb.webp`;
      const pngUrl = `/comic/panels/${panelId}-thumb.png`;

      await Promise.all([
        cache.add(webpUrl),
        cache.add(pngUrl)
      ]);
    } catch (error) {
      console.warn(`Failed to precache ${panelId}:`, error);
    }
  }
}

console.log('🎯 FQST-013 Enhanced Service Worker v1.0 loaded');
console.log('📊 Multi-tier caching strategy active');
console.log('🎊 Enhanced Alice v2.0 L3 Phase 3 ready');