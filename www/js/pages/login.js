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
                    <img src="img/logo.png" alt="CharisPay"
                         style="width:110px;height:110px;object-fit:contain;margin-bottom:4px">
                    <h1>CharisPay</h1>
                    <p>Sistem Pembayaran SPP</p>
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

                <div style="text-align:center;margin-top:12px">
                    <a onclick="showLupaPassword()"
                       style="color:var(--primary);font-size:14px;cursor:pointer;text-decoration:none">
                        Lupa Password?
                    </a>
                </div>

                <div class="auth-link" style="margin-top:12px">
                    Belum punya akun? <a href="#register">Daftar di sini</a>
                </div>

                <!-- Modal Lupa Password -->
                <div id="modal-lupa-password" class="modal-overlay hidden">
                    <div class="modal">
                        <div class="modal-title">Lupa Password</div>
                        <p class="text-sm text-secondary mb-16">
                            Masukkan email Anda. Kami akan mengirim link untuk reset password.
                        </p>
                        <div id="lupa-error" class="form-error" style="margin-bottom:10px"></div>
                        <div id="lupa-success" style="color:var(--success);font-size:13px;margin-bottom:10px;display:none">
                            ✅ Link reset password sudah dikirim ke email Anda. Cek inbox atau folder spam.
                        </div>
                        <div class="form-group" id="lupa-form-group">
                            <label>Email</label>
                            <input type="email" id="lupa-email"
                                   placeholder="Masukkan email yang terdaftar">
                        </div>
                        <div class="modal-actions" id="lupa-actions">
                            <button class="btn btn-secondary"
                                    onclick="tutupLupaPassword()">Batal</button>
                            <button class="btn btn-primary" id="btn-kirim-reset"
                                    onclick="kirimResetPassword()">Kirim Link</button>
                        </div>
                        <button class="btn btn-secondary" id="btn-tutup-lupa"
                                style="display:none;margin-top:8px"
                                onclick="tutupLupaPassword()">Tutup</button>
                    </div>
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

function showLupaPassword() {
  document.getElementById("lupa-email").value = "";
  document.getElementById("lupa-error").textContent = "";
  document.getElementById("lupa-success").style.display = "none";
  document.getElementById("lupa-form-group").style.display = "block";
  document.getElementById("lupa-actions").style.display = "flex";
  document.getElementById("btn-tutup-lupa").style.display = "none";
  document.getElementById("modal-lupa-password").classList.remove("hidden");
}

function tutupLupaPassword() {
  document.getElementById("modal-lupa-password").classList.add("hidden");
}

async function kirimResetPassword() {
  const email = document.getElementById("lupa-email").value.trim();
  const errEl = document.getElementById("lupa-error");
  errEl.textContent = "";

  if (!email) {
    errEl.textContent = "Email wajib diisi";
    return;
  }
  if (!Helpers.isValidEmail(email)) {
    errEl.textContent = "Format email tidak valid";
    return;
  }

  Helpers.btnLoading("btn-kirim-reset", "Mengirim...");
  try {
    await auth.sendPasswordResetEmail(email);

    // Tampilkan pesan sukses, sembunyikan form
    document.getElementById("lupa-success").style.display = "block";
    document.getElementById("lupa-form-group").style.display = "none";
    document.getElementById("lupa-actions").style.display = "none";
    document.getElementById("btn-tutup-lupa").style.display = "block";
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      errEl.textContent = "Email tidak terdaftar di sistem";
    } else {
      errEl.textContent = "Gagal mengirim: " + err.message;
    }
    Helpers.btnReset("btn-kirim-reset");
  }
}
