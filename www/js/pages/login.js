/* ============================================================
   Halaman Login
   ============================================================ */

Router.register("login", {
  header: false,
  nav: false,

  render() {
    return `
            <div class="auth-page">
                <div class="auth-logo">
                    <div class="auth-logo-icon">${Icons.student}</div>
                    <h1>SPP Charis</h1>
                    <p>Portal Pembayaran SPP Charis Institute</p>
                </div>

                <div id="login-error" class="form-error" style="margin-bottom:12px"></div>

                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email"
                               placeholder="Masukkan email Anda"
                               autocomplete="email"
                               required>
                        <div class="form-hint">Contoh: orangtua@gmail.com</div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div style="position:relative">
                            <input type="password" id="password"
                                   placeholder="Masukkan password Anda"
                                   autocomplete="current-password"
                                   required
                                   style="padding-right:44px">
                            <span onclick="togglePassword('password', this)"
                                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-secondary);display:flex;align-items:center">
                                ${Icons.eye}
                            </span>
                        </div>
                        <div class="form-hint">Password minimal 6 karakter</div>
                    </div>

                    <button type="submit" class="btn btn-primary" id="btn-login">
                        Masuk
                    </button>
                </form>

                <div class="auth-link" style="margin-top:20px">
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

      if (!email) {
        errorEl.textContent = "Email wajib diisi";
        return;
      }
      if (!password) {
        errorEl.textContent = "Password wajib diisi";
        return;
      }

      Helpers.btnLoading("btn-login", "Masuk...");
      try {
        await auth.signInWithEmailAndPassword(email, password);
        await Auth.loadProfile();
        Router.go(Auth.hasRole("admin") ? "dashboard-admin" : "dashboard-ortu");
      } catch (err) {
        console.error("Login error:", err);
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          errorEl.textContent = "Email atau password salah. Periksa kembali.";
        } else if (err.code === "auth/too-many-requests") {
          errorEl.textContent =
            "Terlalu banyak percobaan. Coba lagi beberapa menit.";
        } else {
          errorEl.textContent = "Login gagal: " + err.message;
        }
        Helpers.btnReset("btn-login");
      }
    });
  },
});

/** Toggle tampil/sembunyikan password */
function togglePassword(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    iconEl.innerHTML = Icons.eyeOff;
  } else {
    input.type = "password";
    iconEl.innerHTML = Icons.eye;
  }
}
