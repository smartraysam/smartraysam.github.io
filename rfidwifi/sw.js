const staticCacheName = 'hotelmanage-static-v1';
const allCaches = [
  staticCacheName
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/rfidwifi/index.html',
        '/rfidwifi/dashboard.html',
        '/rfidwifi/css/inline.css',
        '/rfidwifi/scripts/room.js',
        '/rfidwifi/scripts/idb.js',
        '/rfidwifi/img/ic_add_white_24px.svg',
        '/rfidwifi/img/add-a-button-png.png',
        '/rfidwifi/img/shekel.png'
      ]);
    })
  );
});
//
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('hotelmanage-') &&
                 !allCaches.includes(cacheName);
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/' || requestUrl.pathname === '/rfidwifi/') {
      event.respondWith(caches.match('index.html'));
      return;
    }
  }
//
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
