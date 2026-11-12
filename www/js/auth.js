/* ============================================================
   Auth Helper
   ============================================================
   Fungsi-fungsi untuk cek status login, role pengguna,
   dan logout. Pakai Firebase Authentication + Firestore
   untuk menyimpan role (ortu / admin).
   ============================================================ */

const Auth = {
  user: null, // objek Firebase user
  role: null, // 'ortu' atau 'admin'
  profile: null, // data tambahan dari Firestore

  /** Cek apakah user sedang login */
  isLoggedIn() {
    return !!this.user;
  },

  /** Ambil role user ('ortu' atau 'admin') */
  getRole() {
    return this.role;
  },

  /** Cek apakah role user sesuai */
  hasRole(role) {
    return this.role === role;
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
    const doc = await db.collection("users").doc(this.user.uid).get();
    if (doc.exists) {
      this.profile = doc.data();
      this.role = this.profile.role || "ortu";
    }
    return this.profile;
  },

  /** Ambil siswaId dari profil ortu (kalau sudah dihubungkan admin) */
  getSiswaId() {
    return this.profile ? this.profile.siswaId || null : null;
  },

  /** Logout user */
  async logout() {
    await auth.signOut();
    this.user = null;
    this.role = null;
    this.profile = null;
    Router.go("login");
  },
};

/* ---------- Listener status login Firebase ---------- */
// Dipanggil otomatis saat user login/logout
auth.onAuthStateChanged(async (user) => {
  if (user) {
    Auth.user = user;
    await Auth.loadProfile();
  } else {
    Auth.user = null;
    Auth.role = null;
    Auth.profile = null;
  }
});
