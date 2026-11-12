/* ============================================================
   Router — Hash-based SPA Router
   ============================================================
   Navigasi antar halaman pakai URL hash (#/halaman).
   Setiap halaman mendaftarkan dirinya via Router.register().

   Contoh:
     #splash           → halaman splash
     #login            → halaman login
     #detail-tagihan/123 → detail tagihan dengan ID 123
   ============================================================ */

const Router = {
    routes: {},       // daftar semua route terdaftar
    current: null,     // nama route yang sedang aktif
    history: [],       // untuk tombol back

    /** Inisialisasi router — dengarkan perubahan hash */
    init() {
        window.addEventListener('hashchange', () => this.handle());
        this.handle();
    },

    /** Daftarkan sebuah halaman */
    register(name, config) {
        this.routes[name] = config;
    },

    /** Navigasi ke halaman tertentu */
    go(name, ...params) {
        let hash = name;
        if (params.length) hash += '/' + params.join('/');
        window.location.hash = hash;
    },

    /** Proses route saat ini berdasarkan hash URL */
    handle() {
        const hash = window.location.hash.slice(1) || 'splash';
        const parts = hash.split('/');
        const name = parts[0];
        const params = parts.slice(1);

        const route = this.routes[name];

        // Route tidak ditemukan → balik ke splash
        if (!route) {
            return this.go('splash');
        }

        // Cek autentikasi
        if (route.requireAuth && !Auth.isLoggedIn()) {
            return this.go('login');
        }

        // Cek role
        if (route.role && !Auth.hasRole(route.role)) {
            // Redirect ke dashboard sesuai role
            return this.go(Auth.hasRole('admin') ? 'dashboard-admin' : 'dashboard-ortu');
        }

        this.history.push(this.current);
        this.current = name;

        // Render header
        this.renderHeader(route);

        // Render konten halaman
        const content = document.getElementById('app-content');
        content.innerHTML = route.render ? route.render(params) : '';

        // Render bottom navigation
        this.renderNav(route);

        // Jalankan init halaman (binding event, dll)
        if (route.init) {
            route.init(params);
        }
    },

    /** Render header bar atas */
    renderHeader(route) {
        const header = document.getElementById('app-header');

        // Halaman tanpa header (splash, login, register)
        if (route.header === false) {
            header.style.display = 'none';
            return;
        }

        header.style.display = 'flex';
        let html = '';

        // Tombol back
        if (route.back) {
            const backTo = route.backTo || (Auth.hasRole('admin') ? 'dashboard-admin' : 'dashboard-ortu');
            html += `<div class="header-back" onclick="Router.go('${backTo}')">${Icons.arrowLeft}</div>`;
        }

        // Judul
        html += `<div class="header-title">${route.title || ''}</div>`;

        // Aksi kanan (opsional)
        if (route.action) {
            html += `<div class="header-action" onclick="${route.action}">${route.actionIcon || Icons.logout}</div>`;
        }

        header.innerHTML = html;
    },

    /** Render bottom navigation */
    renderNav(route) {
        const nav = document.getElementById('app-nav');

        // Halaman tanpa bottom nav
        if (!route.nav) {
            nav.style.display = 'none';
            return;
        }

        nav.style.display = 'flex';

        // Tentukan menu berdasarkan role
        const items = Auth.hasRole('admin') ? NAV_ITEMS.admin : NAV_ITEMS.ortu;

        let html = '<div class="nav-inner">';
        for (const item of items) {
            const active = this.current === item.route ? 'active' : '';
            html += `
                <a class="nav-item ${active}" href="#${item.route}">
                    ${item.icon}
                    <span>${item.label}</span>
                </a>
            `;
        }
        html += '</div>';

        nav.innerHTML = html;
    },

    /** Tampilkan toast notification */
    toast(message) {
        // Hapus toast lama
        const old = document.querySelector('.toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
};

/* ---------- Konfigurasi Bottom Navigation per Role ---------- */

const NAV_ITEMS = {
    ortu: [
        {
            route: 'dashboard-ortu',
            label: 'Beranda',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
        },
        {
            route: 'tagihan',
            label: 'Tagihan',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>'
        },
        {
            route: 'riwayat',
            label: 'Riwayat',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>'
        },
        {
            route: 'panduan',
            label: 'Bantuan',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>'
        }
    ],
    admin: [
        {
            route: 'dashboard-admin',
            label: 'Beranda',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
        },
        {
            route: 'data-siswa',
            label: 'Siswa',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
        },
        {
            route: 'verifikasi',
            label: 'Verifikasi',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        },
        {
            route: 'laporan',
            label: 'Laporan',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>'
        }
    ]
};
