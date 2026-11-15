/* ============================================================
   CharisPay — Service Worker (PWA Offline App Shell & Cache)
   ============================================================ */

const CACHE_NAME = "charispay-shell-v2";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./logo.png",
  "./img/logo.png",
  "./img/icon-180.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./js/helpers.js",
  "./js/auth.js",
  "./js/router.js",
  "./js/firebase-config.js",
  "./js/cloudinary-config.js",
  "./js/kelas-config.js",
  "./js/tagihan-ortu.js",
  "./js/pages/splash.js",
  "./js/pages/login.js",
  "./js/pages/register.js",
  "./js/pages/wali-kelas.js",
  "./js/pages/dashboard-ortu.js",
  "./js/pages/tagihan.js",
  "./js/pages/detail-tagihan.js",
  "./js/pages/pembayaran.js",
  "./js/pages/riwayat.js",
  "./js/pages/nilai.js",
  "./js/pages/panduan.js",
  "./js/pages/dashboard-admin.js",
  "./js/pages/data-siswa.js",
  "./js/pages/tagihan-admin.js",
  "./js/pages/verifikasi.js",
  "./js/pages/laporan.js",
  "./js/pages/profil.js",
  "./js/index.js",
];

// 1. Install Event — Pre-cache static shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        for (const asset of PRECACHE_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn("ServiceWorker: gagal precache " + asset, err);
          }
        }
      })
      .then(() => self.skipWaiting()),
  );
});

// 2. Activate Event — Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event — Network-First for app shell, Bypass for Firebase / Cloudinary
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan sentuh request non-GET atau request ke domain Firebase / API luar
  if (req.method !== "GET") return;
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("cloudinary") ||
    url.hostname.includes("wa.me")
  ) {
    return;
  }

  // Strategi: Network-First dengan Cache Fallback untuk aset lokal
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone);
          });
        }
        return networkRes;
      })
      .catch(async () => {
        const cachedRes = await caches.match(req);
        if (cachedRes) return cachedRes;

        // Fallback navigasi offline ke shell index.html
        if (req.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
        }
      }),
  );
});
