/* ============================================================
   Auth Helper
   ============================================================
   Fungsi-fungsi untuk cek status login, role pengguna,
   dan logout. Pakai Firebase Authentication + Firestore
   untuk menyimpan role (ortu / admin).
   ============================================================ */

const Auth = {
  user: null, // objek Firebase user
  role: localStorage.getItem("auth_role") || null, // 'ortu' atau 'admin' (tersinkron di storage)
  profile: null, // data tambahan dari Firestore

  /** Cek apakah user sedang login */
  isLoggedIn() {
    return !!this.user;
  },

  /** Ambil role user ('ortu' atau 'admin') */
  getRole() {
    return this.role || localStorage.getItem("auth_role");
  },

  /** Set role dan simpan ke localStorage */
  setRole(r) {
    this.role = r;
    if (r) localStorage.setItem("auth_role", r);
    else localStorage.removeItem("auth_role");
  },

  /** Cek apakah role user sesuai */
  hasRole(role) {
    const current = this.role || localStorage.getItem("auth_role");
    return current === role;
  },

  /** Ambil UID user */
  getUid() {
    return this.user ? this.user.uid : null;
  },

  /**
   * Ambil data profil user dari Firestore (koleksi 'users').
   * Data berisi: nama, role, email, dll.
   */
  async loadProfile() {
    if (!this.user) return null;
    try {
      const doc = await db.collection("users").doc(this.user.uid).get();
      if (doc.exists) {
        this.profile = doc.data();
        this.setRole(this.profile.role || "ortu");
      }
    } catch (e) {
      console.warn("Gagal memuat profil user:", e);
    }
    return this.profile;
  },

  /** Ambil siswaIds (array) dari profil ortu — support multi anak */
  getSiswaIds() {
    if (!this.profile) return [];
    if (
      Array.isArray(this.profile.siswaIds) &&
      this.profile.siswaIds.length > 0
    ) {
      return this.profile.siswaIds;
    }
    if (this.profile.siswaId) {
      return [this.profile.siswaId];
    }
    return [];
  },

  /** Ambil siswaId tunggal (backward compat) */
  getSiswaId() {
    const ids = this.getSiswaIds();
    return ids.length > 0 ? ids[0] : null;
  },

  /** Logout user */
  async logout() {
    try {
      await auth.signOut();
    } catch (e) {
      // ignore
    }
    this.user = null;
    this.setRole(null);
    this.profile = null;
    Router.go("login");
  },
};

/* ---------- Listener status login Firebase ---------- */
auth.onAuthStateChanged(async (user) => {
  if (user) {
    Auth.user = user;
    await Auth.loadProfile();
    // Segera segarkan layout router setelah profil & role selesai diverifikasi
    if (typeof Router !== "undefined" && Router.current && Router.routes[Router.current]) {
      Router.updateLayout(Router.routes[Router.current]);
    }
  } else {
    Auth.user = null;
    Auth.setRole(null);
    Auth.profile = null;
    if (typeof Router !== "undefined" && Router.current && Router.routes[Router.current]) {
      Router.updateLayout(Router.routes[Router.current]);
    }
  }
});
