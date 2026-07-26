const EXTRA_ASSETS=["./concept-data.js", "./concept-study.js", "./study-images/subject1-page-01.jpg", "./study-images/subject1-page-02.jpg", "./study-images/subject1-page-03.jpg", "./study-images/subject1-page-04.jpg", "./study-images/subject1-page-05.jpg", "./study-images/subject1-page-06.jpg", "./study-images/subject1-page-07.jpg", "./study-images/subject1-page-08.jpg", "./study-images/subject1-page-09.jpg", "./study-images/subject1-page-10.jpg", "./study-images/subject1-page-11.jpg", "./study-images/subject1-page-12.jpg", "./study-images/subject1-page-13.jpg", "./study-images/subject1-page-14.jpg", "./study-images/subject1-page-15.jpg", "./study-images/subject1-page-16.jpg", "./study-images/subject1-page-17.jpg", "./study-images/subject1-page-18.jpg", "./study-images/subject1-page-19.jpg", "./study-images/subject1-page-20.jpg", "./study-images/subject1-page-21.jpg", "./study-images/subject1-page-22.jpg", "./study-images/subject1-page-23.jpg", "./study-images/subject1-page-24.jpg", "./study-images/subject1-page-25.jpg", "./study-images/subject1-page-26.jpg", "./study-images/subject1-page-27.jpg", "./study-images/subject1-page-28.jpg", "./study-images/subject1-page-29.jpg", "./study-images/subject1-page-30.jpg", "./study-images/subject1-page-31.jpg", "./study-images/subject1-page-32.jpg", "./study-images/subject1-page-33.jpg", "./study-images/subject1-page-34.jpg", "./study-images/subject1-page-35.jpg", "./study-images/subject1-page-36.jpg", "./study-images/subject1-page-37.jpg", "./study-images/subject1-page-38.jpg", "./study-images/subject1-page-39.jpg", "./study-images/subject1-page-40.jpg", "./study-images/subject1-page-41.jpg", "./study-images/subject1-page-42.jpg", "./study-images/subject1-page-43.jpg", "./study-images/subject1-page-44.jpg", "./study-images/subject1-page-45.jpg", "./study-images/subject1-page-46.jpg", "./study-images/subject1-page-47.jpg", "./study-images/subject1-page-48.jpg", "./study-images/subject1-page-49.jpg", "./study-images/subject1-page-50.jpg", "./study-images/subject1-page-51.jpg", "./study-images/subject1-page-52.jpg", "./study-images/subject1-page-53.jpg", "./study-images/subject1-page-54.jpg", "./study-images/subject1-page-55.jpg", "./study-images/subject1-page-56.jpg", "./study-images/subject1-page-57.jpg", "./study-images/subject1-page-58.jpg", "./study-images/subject1-page-59.jpg", "./study-images/subject1-page-60.jpg", "./study-images/subject1-page-61.jpg", "./study-images/subject1-page-62.jpg", "./study-images/subject1-page-63.jpg", "./study-images/subject1-page-64.jpg", "./study-images/subject1-page-65.jpg", "./study-images/subject1-page-66.jpg", "./study-images/subject1-page-67.jpg", "./study-images/subject1-page-68.jpg", "./study-images/subject1-page-69.jpg", "./study-images/subject1-page-70.jpg"];
const CACHE_NAME = "multipass-pwa-v6-concept-study";
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type !== "opaque") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));

      return cached || networkFetch;
    })
  );
});
