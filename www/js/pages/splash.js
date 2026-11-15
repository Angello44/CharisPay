/* ============================================================
   Halaman Splash
   ============================================================
   Layar pertama yang tampil saat app dibuka.
   Otomatis redirect ke login (kalau belum login) atau
   ke dashboard sesuai role (kalau sudah login) setelah 2 detik.
   ============================================================ */

Router.register("splash", {
  header: false,
  nav: false,

  render() {
    return `
            <div class="splash">
                <img src="img/logo.png"
                     alt="CharisPay"
                     style="width:140px;height:140px;object-fit:contain;border-radius:24px;margin-bottom:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15)">
                <div class="splash-subtitle">Sistem Pembayaran SPP</div>
                <div class="splash-spinner"></div>
            </div>
        `;
  },

  init() {
    // Tunggu 2 detik, lalu redirect
    setTimeout(() => {
      if (Auth.isLoggedIn() && Auth.role) {
        // Sudah login → ke dashboard sesuai role
        Router.go(Auth.hasRole("admin") ? "dashboard-admin" : "dashboard-ortu");
      } else {
        // Belum login → ke halaman login
        Router.go("login");
      }
    }, 2000);
  },
});
