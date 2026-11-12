/* ============================================================
   Halaman Splash
   ============================================================
   Layar pertama yang tampil saat app dibuka.
   Otomatis redirect ke login (kalau belum login) atau
   ke dashboard sesuai role (kalau sudah login) setelah 2 detik.
   ============================================================ */

Router.register('splash', {
    header: false,
    nav: false,

    render() {
        return `
            <div class="splash">
                <div class="splash-icon">${Icons.student}</div>
                <div class="splash-logo">SPP Charis</div>
                <div class="splash-subtitle">Charis Institute &bull; Portal Orang Tua</div>
                <div class="splash-spinner"></div>
            </div>
        `;
    },

    init() {
        // Tunggu 2 detik, lalu redirect
        setTimeout(() => {
            if (Auth.isLoggedIn() && Auth.role) {
                // Sudah login → ke dashboard sesuai role
                Router.go(Auth.hasRole('admin') ? 'dashboard-admin' : 'dashboard-ortu');
            } else {
                // Belum login → ke halaman login
                Router.go('login');
            }
        }, 2000);
    }
});
