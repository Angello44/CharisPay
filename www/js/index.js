/* ============================================================
   Inisialisasi Aplikasi
   ============================================================
   Tunggu deviceready (Cordova), baru jalankan router.
   Kalau di browser (bukan di HP), langsung jalan.
   ============================================================ */

function startApp() {
  console.log("App started — Cordova ready");
  Router.init();
}

// Registrasi Service Worker untuk Progressive Web App (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("PWA Service Worker terdaftar dengan scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("PWA Service Worker gagal terdaftar:", err);
      });
  });
}

if (typeof cordova !== "undefined") {
  // Di dalam aplikasi Cordova (Android)
  document.addEventListener("deviceready", startApp, false);
} else {
  // Di browser biasa (untuk testing/debugging)
  document.addEventListener("DOMContentLoaded", startApp);
}
