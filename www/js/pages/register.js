/* ============================================================
   Halaman Registrasi
   ============================================================ */

Router.register("register", {
  header: false,
  nav: false,

  render() {
    return `
            <div class="auth-page">
                <div class="auth-logo">
                    <h1>Daftar Akun</h1>
                    <p>Buat akun orang tua / wali siswa</p>
                </div>

                <div id="register-error" class="form-error" style="margin-bottom:12px"></div>

                <form id="register-form">
                    <!-- Nama Orang Tua -->
                    <div class="form-group">
                        <label for="nama">Nama Lengkap Orang Tua / Wali</label>
                        <input type="text" id="nama"
                               placeholder="cth: Bapak Ahmad atau Ibu Sari"
                               autocomplete="name"
                               required>
                        <div class="form-hint">Nama sesuai identitas resmi</div>
                    </div>

                    <!-- No HP -->
                    <div class="form-group">
                        <label for="nohp">Nomor HP / WhatsApp</label>
                        <input type="tel" id="nohp"
                               placeholder="cth: 081234567890"
                               autocomplete="tel">
                        <div class="form-hint">Aktif dan bisa dihubungi pihak sekolah</div>
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email"
                               placeholder="cth: ahmad@gmail.com"
                               autocomplete="email"
                               required>
                        <div class="form-hint">Dipakai untuk login ke aplikasi</div>
                    </div>

                    <!-- Password -->
                    <div class="form-group">
                        <label for="password">Password</label>
                        <div style="position:relative">
                            <input type="password" id="password"
                                   placeholder="Buat password minimal 6 karakter"
                                   autocomplete="new-password"
                                   required minlength="6"
                                   style="padding-right:44px">
                            <span onclick="togglePassword('password', this)"
                                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:18px;user-select:none">
                                👁
                            </span>
                        </div>
                        <div class="form-hint">Minimal 6 karakter, campuran huruf dan angka lebih aman</div>
                    </div>

                    <!-- Konfirmasi Password -->
                    <div class="form-group">
                        <label for="konfirmasi-password">Konfirmasi Password</label>
                        <div style="position:relative">
                            <input type="password" id="konfirmasi-password"
                                   placeholder="Ketik ulang password Anda"
                                   autocomplete="new-password"
                                   required
                                   style="padding-right:44px">
                            <span onclick="togglePassword('konfirmasi-password', this)"
                                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:18px;user-select:none">
                                👁
                            </span>
                        </div>
                    </div>

                    <div class="card" style="background:var(--primary-light);margin-bottom:16px">
                        <p class="text-sm" style="color:var(--primary)">
                            ℹ️ Setelah daftar, tambahkan data anak Anda di halaman utama menggunakan <strong>Nama</strong> atau <strong>NIS</strong> anak.
                        </p>
                    </div>

                    <button type="submit" class="btn btn-primary" id="btn-register">
                        Daftar Sekarang
                    </button>
                </form>

                <div class="auth-link" style="margin-top:20px">
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
      const nohp = document.getElementById("nohp").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const konfirmasi = document.getElementById("konfirmasi-password").value;
      errorEl.textContent = "";

      // Validasi
      if (!nama) {
        errorEl.textContent = "Nama lengkap wajib diisi";
        return;
      }
      if (!email) {
        errorEl.textContent = "Email wajib diisi";
        return;
      }
      if (!Helpers.isValidEmail(email)) {
        errorEl.textContent =
          "Format email tidak valid. Contoh: nama@gmail.com";
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = "Password minimal 6 karakter";
        return;
      }
      if (password !== konfirmasi) {
        errorEl.textContent = "Password dan konfirmasi password tidak sama";
        return;
      }

      Helpers.btnLoading("btn-register", "Mendaftarkan...");
      try {
        // 1. Buat akun Firebase Auth
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // 2. Simpan data profil ke Firestore
        await db
          .collection("users")
          .doc(cred.user.uid)
          .set({
            nama,
            nohp: nohp || "",
            email,
            role: "ortu",
            siswaIds: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

        // 3. Load profil
        await Auth.loadProfile();

        Router.toast("Pendaftaran berhasil! Silakan tambahkan data anak Anda.");
        Router.go("dashboard-ortu");
      } catch (err) {
        console.error("Register error:", err);
        if (err.code === "auth/email-already-in-use") {
          errorEl.textContent =
            "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
        } else if (err.code === "auth/invalid-email") {
          errorEl.textContent = "Format email tidak valid";
        } else {
          errorEl.textContent = "Pendaftaran gagal: " + err.message;
        }
        Helpers.btnReset("btn-register");
      }
    });
  },
});

/** Toggle tampil/sembunyikan password (shared dengan login.js) */
// Sudah didefinisikan di login.js — tidak perlu didefinisikan ulang
