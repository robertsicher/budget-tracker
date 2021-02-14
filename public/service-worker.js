// Cached files
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/manifest.webmanifest",
  "/styles.css",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";


//create the cache

self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files have been cached");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

//Cache remover

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Old cache cleared", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

//Store API Calls

self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            //If it was good, store it
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Failed, get it from the cache
            return cache.match(evt.request);
          });
      }).catch(err => console.log(`Error: service-worker.js`, err))
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    }).catch(err => console.log(`Error: service-worker.js`, err))
  );
});

//Get REquests

self.addEventListener("fetch", function (evt) {
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});