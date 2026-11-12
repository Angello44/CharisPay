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

if (typeof cordova !== "undefined") {
  // Di dalam aplikasi Cordova (Android)
  document.addEventListener("deviceready", startApp, false);
} else {
  // Di browser biasa (untuk testing/debugging)
  document.addEventListener("DOMContentLoaded", startApp);
}
