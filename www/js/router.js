/* ============================================================
   Router — Hash-based SPA Router (Desktop Admin & Mobile HP Support)
   ============================================================
   Navigasi antar halaman pakai URL hash (#/halaman).
   Setiap halaman mendaftarkan dirinya via Router.register().

   Prinsip Desain:
   - Admin di layar desktop (>=768px): Tampilan Desktop dengan sidebar navigasi lengkap.
   - Orang Tua di SEMUA layar (HP maupun monitor desktop): Tetap tampilan HP (Mobile View).
   - Halaman publik (login, register, splash): Tampilan HP rapi di tengah tanpa sidebar.
   ============================================================ */

const Router = {
  routes: {},    // daftar semua route terdaftar
  current: null, // nama route yang sedang aktif
  history: [],   // untuk tombol back

  /** Inisialisasi router — dengarkan perubahan hash dan perubahan ukuran layar */
  init() {
    window.addEventListener("hashchange", () => this.handle());

    // Tanggapi resize layar secara dinamis (mobile <-> desktop)
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const route = this.routes[this.current];
        if (route) {
          this.updateLayout(route);
        }
      }, 100);
    });

    this.handle();
  },

  /** Daftarkan sebuah halaman */
  register(name, config) {
    this.routes[name] = config;
  },

  /** Navigasi ke halaman tertentu */
  go(name, ...params) {
    let hash = name;
    if (params.length) hash += "/" + params.join("/");
    window.location.hash = hash;
  },

  /**
   * Cek apakah saat ini harus memakai layout Desktop Admin:
   * Layar desktop (>= 768px) dan membuka halaman admin (route.role === 'admin')
   */
  isDesktopAdmin(route) {
    if (window.innerWidth < 768) return false;
    if (!route || route.role !== "admin") return false;
    return true;
  },

  /** Update header, nav, dan sidebar tanpa merender ulang konten halaman */
  updateLayout(route) {
    this.renderHeader(route);
    this.renderNav(route);
  },

  /** Proses route saat ini berdasarkan hash URL */
  handle() {
    const hash = window.location.hash.slice(1) || "splash";
    const parts = hash.split("/");
    const name = parts[0];
    const params = parts.slice(1);

    const route = this.routes[name];

    // Route tidak ditemukan -> balik ke splash
    if (!route) {
      return this.go("splash");
    }

    // Cek autentikasi
    if (route.requireAuth && !Auth.isLoggedIn()) {
      return this.go("login");
    }

    // Cek role
    if (route.role && !Auth.hasRole(route.role)) {
      // Redirect ke dashboard sesuai role
      return this.go(
        Auth.hasRole("admin") ? "dashboard-admin" : "dashboard-ortu"
      );
    }

    this.history.push(this.current);
    this.current = name;

    // Render header
    this.renderHeader(route);

    // Render konten halaman
    const content = document.getElementById("app-content");
    content.innerHTML = route.render ? route.render(params) : "";

    // Render navigasi (desktop sidebar ATAU mobile bottom nav)
    this.renderNav(route);

    // Jalankan init halaman (binding event, dll)
    if (route.init) {
      route.init(params);
    }
  },

  /** Render header bar atas */
  renderHeader(route) {
    const header = document.getElementById("app-header");
    if (!header) return;

    // Halaman tanpa header (splash, login, register)
    if (route.header === false) {
      header.style.display = "none";
      return;
    }

    const isDesktop = this.isDesktopAdmin(route);

    if (isDesktop) {
      // Header untuk Desktop Admin
      header.style.display = "flex";
      const adminName = (Auth.profile && Auth.profile.nama) || "Petugas Keuangan";

      let actionHtml = "";
      if (route.action && route.action !== "Auth.logout()") {
        let actionLabel = "Aksi";
        if (route.action.includes("showFormSiswa")) actionLabel = "Tambah Siswa";
        else if (route.action.includes("showPilihJenisTagihan") || route.action.includes("showFormTagihan")) actionLabel = "Buat Tagihan";
        else if (route.action.includes("showFormWali")) actionLabel = "Tambah Wali Kelas";

        actionHtml = `
          <button class="btn btn-primary btn-sm desktop-header-action" onclick="${route.action}">
            ${route.actionIcon || Icons.plus}
            <span>${actionLabel}</span>
          </button>
        `;
      }

      header.innerHTML = `
        <div class="desktop-header-left">
          <div class="desktop-header-breadcrumb">CharisPay &rsaquo; Admin Portal</div>
          <div class="desktop-header-title">${route.title || "Dashboard Admin"}</div>
        </div>
        <div class="desktop-header-right">
          ${actionHtml}
          <div class="desktop-admin-badge">
            <div class="admin-avatar-small">${adminName.charAt(0).toUpperCase()}</div>
            <div class="admin-badge-info">
              <span class="admin-badge-name">${adminName}</span>
              <span class="admin-badge-role">Petugas Keuangan</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Header default Mobile (untuk Orang Tua & Admin di ponsel)
    header.style.display = "flex";
    let html = "";

    // Tombol back
    if (route.back) {
      const backTo =
        route.backTo ||
        (Auth.hasRole("admin") ? "dashboard-admin" : "dashboard-ortu");
      html += `<div class="header-back" onclick="Router.go('${backTo}')">${Icons.arrowLeft}</div>`;
    }

    // Judul
    html += `<div class="header-title">${route.title || ""}</div>`;

    // Aksi kanan pada mobile
    if (route.action) {
      html += `<div class="header-action" onclick="${route.action}">${route.actionIcon || Icons.logout}</div>`;
    }

    header.innerHTML = html;
  },

  /** Render navigasi: Sidebar Desktop ATAU Bottom Nav Mobile */
  renderNav(route) {
    const nav = document.getElementById("app-nav");
    const sidebar = document.getElementById("app-sidebar");
    const app = document.getElementById("app");
    if (!nav || !app) return;

    const isDesktop = this.isDesktopAdmin(route);

    if (isDesktop) {
      // 1. TAMPILAN DESKTOP ADMIN
      app.classList.add("has-sidebar");
      if (sidebar) {
        sidebar.style.display = "flex";
        this.renderSidebar();
      }
      nav.style.display = "none";
      nav.innerHTML = "";
    } else {
      // 2. TAMPILAN HP (ORANG TUA & HALAMAN PUBLIK & ADMIN MOBILE)
      app.classList.remove("has-sidebar");
      if (sidebar) {
        sidebar.style.display = "none";
        sidebar.innerHTML = "";
      }

      // Halaman tanpa bottom nav (splash, login, register, detail-tagihan, dsb)
      if (!route.nav) {
        nav.style.display = "none";
        nav.innerHTML = "";
        return;
      }

      // Render mobile bottom navigation
      nav.style.display = "flex";
      const isAdmin = Auth.hasRole("admin");
      const items = isAdmin ? NAV_ITEMS.admin_mobile : NAV_ITEMS.ortu;
      let html = '<div class="nav-inner">';
      for (const item of items) {
        const active = this.current === item.route ? "active" : "";
        html += `
          <a class="nav-item ${active}" href="#${item.route}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `;
      }
      html += "</div>";
      nav.innerHTML = html;
    }
  },

  /** Render sidebar admin untuk tampilan desktop */
  renderSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    const items = NAV_ITEMS.admin_sidebar;
    let menuHtml = "";
    for (const item of items) {
      const active = this.current === item.route ? "active" : "";
      const badgeHtml = item.badge ? `<span id="${item.badge}" class="sidebar-badge" style="display:none">0</span>` : "";
      menuHtml += `
        <a class="sidebar-item ${active}" href="#${item.route}">
          <span class="sidebar-icon">${item.icon}</span>
          <span class="sidebar-label">${item.label}</span>
          ${badgeHtml}
        </a>
      `;
    }

    const adminName = (Auth.profile && Auth.profile.nama) || "Charis Institute";

    sidebar.innerHTML = `
      <!-- Brand & Profile Header Sesuai Referensi Gambar (Avatar Lingkaran Besar + Aksen Cincin) -->
      <div class="sidebar-brand-header">
        <div class="sidebar-brand-avatar-wrap">
          <div class="sidebar-brand-avatar">
            <span>${adminName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div class="sidebar-brand-name">${adminName}</div>
        <div class="sidebar-brand-role">Petugas Keuangan SPP</div>
      </div>

      <div class="sidebar-nav-label">Menu Admin</div>
      <nav class="sidebar-menu">${menuHtml}</nav>

      <div class="sidebar-footer">
        <button class="sidebar-logout" onclick="Auth.logout()">
          <span>${typeof Icons !== "undefined" ? Icons.logout : ""}</span>
          <span>Keluar Akun</span>
        </button>
      </div>
    `;

    // Ambil data notifikasi verifikasi untuk sidebar badge
    this.updateSidebarBadges();
  },

  /** Update badge notifikasi verifikasi pada sidebar */
  async updateSidebarBadges() {
    try {
      if (typeof db !== "undefined") {
        const snap = await db.collection("transaksi").where("status", "==", "menunggu").get();
        const count = snap.size;
        const badgeEl = document.getElementById("badge-verif-sidebar");
        if (badgeEl) {
          if (count > 0) {
            badgeEl.textContent = count;
            badgeEl.style.display = "inline-flex";
          } else {
            badgeEl.style.display = "none";
          }
        }
      }
    } catch (e) {
      // Abaikan bila offline/error
    }
  },

  /** Tampilkan toast notification */
  toast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  },
};

/* ---------- Konfigurasi Navigasi per Role & Device ---------- */

const NAV_ITEMS = {
  // Mobile Bottom Nav untuk Orang Tua (Selalu HP)
  get ortu() {
    return [
      {
        route: "dashboard-ortu",
        label: "Beranda",
        icon: typeof Icons !== "undefined" ? Icons.wallet : "",
      },
      {
        route: "tagihan",
        label: "Tagihan",
        icon: typeof Icons !== "undefined" ? Icons.receipt : "",
      },
      {
        route: "riwayat",
        label: "Riwayat",
        icon: typeof Icons !== "undefined" ? Icons.history : "",
      },
      {
        route: "panduan",
        label: "Bantuan",
        icon: typeof Icons !== "undefined" ? Icons.guide : "",
      },
    ];
  },

  // Mobile Bottom Nav untuk Admin (saat dibuka di layar HP < 768px)
  get admin_mobile() {
    return [
      {
        route: "dashboard-admin",
        label: "Beranda",
        icon: typeof Icons !== "undefined" ? Icons.receipt : "",
      },
      {
        route: "data-siswa",
        label: "Siswa",
        icon: typeof Icons !== "undefined" ? Icons.students : "",
      },
      {
        route: "verifikasi",
        label: "Verifikasi",
        icon: typeof Icons !== "undefined" ? Icons.verified : "",
      },
      {
        route: "laporan",
        label: "Laporan",
        icon: typeof Icons !== "undefined" ? Icons.report : "",
      },
    ];
  },

  // Sidebar Desktop Lengkap untuk Admin (saat dibuka di monitor >= 768px)
  get admin_sidebar() {
    return [
      {
        route: "dashboard-admin",
        label: "Dashboard",
        icon: typeof Icons !== "undefined" ? Icons.receipt : "",
        badge: null,
      },
      {
        route: "data-siswa",
        label: "Data Siswa",
        icon: typeof Icons !== "undefined" ? Icons.students : "",
        badge: null,
      },
      {
        route: "tagihan-admin",
        label: "Kelola Tagihan",
        icon: typeof Icons !== "undefined" ? Icons.wallet : "",
        badge: null,
      },
      {
        route: "verifikasi",
        label: "Verifikasi Bayar",
        icon: typeof Icons !== "undefined" ? Icons.verified : "",
        badge: "badge-verif-sidebar",
      },
      {
        route: "laporan",
        label: "Laporan Keuangan",
        icon: typeof Icons !== "undefined" ? Icons.report : "",
        badge: null,
      },
      {
        route: "wali-kelas",
        label: "Data Wali Kelas",
        icon: typeof Icons !== "undefined" ? Icons.teacher : "",
        badge: null,
      },
      {
        route: "nilai-admin",
        label: "Input Nilai Siswa",
        icon: typeof Icons !== "undefined" ? Icons.grade : "",
        badge: null,
      },
    ];
  },
};
