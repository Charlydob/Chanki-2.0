const CACHE_NAME = "cardshell-v1";
const CORE_ASSETS = ["./", "./index.html", "./manifest.webmanifest"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((resp) => resp || fetch(event.request)));
});
