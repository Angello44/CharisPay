/* ============================================================
   Halaman Login
   ============================================================
   Form login dengan email & password.
   Setelah login berhasil, ambil role dari Firestore,
   lalu redirect ke dashboard sesuai role.
   ============================================================ */

Router.register("login", {
  header: false,
  nav: false,

  render() {
    return `
            <div class="auth-page">
                <div class="auth-logo">
                    <h1>SPP Charis</h1>
                    <p>Sistem Pembayaran SPP Charis Institute</p>
                </div>

                <div id="login-error" class="form-error" style="margin-bottom:12px"></div>

                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="email@contoh.com" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Masukkan password" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Masuk</button>
                </form>

                <div class="auth-link">
                    Belum punya akun? <a href="#register">Daftar di sini</a>
                </div>
            </div>
        `;
  },

  init() {
    const form = document.getElementById("login-form");
    const errorEl = document.getElementById("login-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      errorEl.textContent = "";

      try {
        // Login dengan Firebase Authentication
        await auth.signInWithEmailAndPassword(email, password);

        // Ambil data user (nama, role) dari Firestore
        await Auth.loadProfile();

        // Redirect ke dashboard sesuai role
        Router.go(Auth.hasRole("admin") ? "dashboard-admin" : "dashboard-ortu");
      } catch (err) {
        console.error("Login error:", err);
        errorEl.textContent = "Email atau password salah";
      }
    });
  },
});
