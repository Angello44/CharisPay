/* ============================================================
   Halaman Registrasi
   ============================================================
   Form registrasi untuk orang tua/wali siswa.
   Data disimpan di Firebase Auth (email/password) + Firestore
   (koleksi 'users' untuk data tambahan: nama, role, dll).
   ============================================================ */

Router.register("register", {
  header: false,
  nav: false,
  back: true,
  backTo: "login",
  title: "Daftar Akun",

  render() {
    return `
            <div class="auth-page">
                <div class="auth-logo">
                    <h1>Daftar Akun</h1>
                    <p>Buat akun orang tua/wali siswa</p>
                </div>

                <div id="register-error" class="form-error" style="margin-bottom:12px"></div>

                <form id="register-form">
                    <div class="form-group">
                        <label for="nama">Nama Lengkap</label>
                        <input type="text" id="nama" placeholder="Nama orang tua/wali" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="email@contoh.com" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Minimal 6 karakter" required minlength="6">
                    </div>

                    <div class="form-group">
                        <label for="nama-siswa">Nama Siswa</label>
                        <input type="text" id="nama-siswa" placeholder="Nama anak Anda" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Daftar</button>
                </form>

                <div class="auth-link">
                    Sudah punya akun? <a href="#login">Masuk di sini</a>
                </div>
            </div>
        `;
  },

  init() {
    const form = document.getElementById("register-form");
    const errorEl = document.getElementById("register-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nama = document.getElementById("nama").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const namaSiswa = document.getElementById("nama-siswa").value.trim();
      errorEl.textContent = "";

      try {
        // 1. Buat akun di Firebase Authentication
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // 2. Simpan data tambahan user ke Firestore (koleksi 'users')
        await db.collection("users").doc(cred.user.uid).set({
          nama: nama,
          email: email,
          role: "ortu", // default: orang tua
          namaSiswa: namaSiswa,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Load profile supaya Auth.role terisi
        await Auth.loadProfile();

        // 4. Redirect ke dashboard
        Router.go("dashboard-ortu");
      } catch (err) {
        console.error("Register error:", err);
        errorEl.textContent = err.message || "Pendaftaran gagal";
      }
    });
  },
});
