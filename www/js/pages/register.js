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
                    <img src="img/logo.png" alt="CharisPay"
                         style="width:110px;height:110px;object-fit:contain;margin-bottom:4px">
                    <h1>Daftar Akun Baru</h1>
                    <p>Portal Orang Tua / Wali Murid</p>
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
                                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-secondary);display:flex;align-items:center">
                                ${Icons.eye}
                            </span>
                        </div>
                        <div class="form-hint" style="display:flex;align-items:center;justify-content:space-between">
                            <span>Minimal 6 karakter, campuran huruf dan angka lebih aman</span>
                            <span id="password-len-counter" style="font-weight:600;font-size:11px;color:var(--text-muted)"></span>
                        </div>
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
                                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-secondary);display:flex;align-items:center">
                                ${Icons.eye}
                            </span>
                        </div>
                        <!-- Progress & Indikator Kecocokan Password Realtime -->
                        <div id="pw-match-wrapper" class="pw-match-wrapper">
                            <div class="pw-progress-track">
                                <div id="pw-progress-bar" class="pw-progress-bar"></div>
                            </div>
                            <div class="pw-match-meta">
                                <span id="pw-match-status" class="pw-match-status">
                                    Ketik ulang password untuk memeriksa kecocokan
                                </span>
                                <span id="pw-match-badge" class="pw-match-badge">0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="background:var(--primary-light);margin-bottom:16px">
                        <p class="text-sm" style="color:var(--primary);display:flex;align-items:flex-start;gap:8px">
                            <span style="flex-shrink:0">${Icons.alertCircle}</span>
                            <span>Setelah mendaftar, tambahkan data anak Anda di halaman utama menggunakan <strong>Nama</strong> atau <strong>NIS</strong> anak.</span>
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
    const p1Input = document.getElementById("password");
    const p2Input = document.getElementById("konfirmasi-password");
    const bar = document.getElementById("pw-progress-bar");
    const statusEl = document.getElementById("pw-match-status");
    const badgeEl = document.getElementById("pw-match-badge");
    const lenCounter = document.getElementById("password-len-counter");

    // Realtime progress validator untuk Password 2 (Konfirmasi Password)
    const updatePasswordMatchProgress = () => {
      if (!p1Input || !p2Input || !bar || !statusEl || !badgeEl) return;

      const p1 = p1Input.value;
      const p2 = p2Input.value;

      // Update counter panjang password pertama
      if (lenCounter) {
        if (p1.length > 0) {
          lenCounter.textContent = `${p1.length} karakter`;
          lenCounter.style.color =
            p1.length >= 6 ? "var(--success)" : "var(--warning-dark)";
        } else {
          lenCounter.textContent = "";
        }
      }

      // Reset style kelas
      bar.className = "pw-progress-bar";
      badgeEl.className = "pw-match-badge";

      // Kondisi 1: Kolom konfirmasi password masih kosong
      if (p2.length === 0) {
        p2Input.style.borderColor = "";
        p2Input.style.boxShadow = "";
        bar.style.width = "0%";
        if (p1.length === 0) {
          statusEl.innerHTML = "Ketik ulang password untuk memeriksa kecocokan";
          statusEl.style.color = "var(--text-secondary)";
          badgeEl.textContent = "0%";
        } else {
          statusEl.innerHTML = "Ketik ulang password Anda persis seperti di atas";
          statusEl.style.color = "var(--text-secondary)";
          badgeEl.textContent = "0%";
        }
        return;
      }

      // Kondisi 2: Password pertama belum diisi sama sekali
      if (p1.length === 0) {
        bar.style.width = "100%";
        bar.classList.add("is-warning");
        badgeEl.classList.add("badge-match-warning");
        p2Input.style.borderColor = "var(--warning)";
        p2Input.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
        statusEl.innerHTML = `<span style="color:var(--warning-dark);display:inline-flex;align-items:center;gap:4px">${Icons.alertCircle} Isi password pertama terlebih dahulu</span>`;
        badgeEl.textContent = "Isi Password 1";
        return;
      }

      // Kondisi 3: Password pertama masih kurang dari 6 karakter
      if (p1.length < 6) {
        const ratio = Math.min(100, Math.round((p2.length / 6) * 100));
        bar.style.width = `${ratio}%`;
        bar.classList.add("is-warning");
        badgeEl.classList.add("badge-match-warning");
        p2Input.style.borderColor = "var(--warning)";
        p2Input.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
        statusEl.innerHTML = `<span style="color:var(--warning-dark);display:inline-flex;align-items:center;gap:4px">${Icons.alertCircle} Password pertama minimal 6 karakter</span>`;
        badgeEl.textContent = "Minimal 6 Karakter";
        return;
      }

      // Kondisi 4: Cocok sempurna 100%
      if (p1 === p2) {
        bar.style.width = "100%";
        bar.classList.add("is-success");
        badgeEl.classList.add("badge-match-success");
        p2Input.style.borderColor = "var(--success)";
        p2Input.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.15)";
        statusEl.innerHTML = `<span style="color:var(--success-dark);display:inline-flex;align-items:center;gap:4px">${Icons.checkCircle} <strong>Password cocok sempurna!</strong></span>`;
        badgeEl.textContent = "100% Cocok";
        return;
      }

      // Kondisi 5: Sedang mengetik dan karakter yang diketik cocok sejauh ini (prefix match)
      const isPrefixMatch = p1.startsWith(p2);

      if (isPrefixMatch && p2.length < p1.length) {
        const percent = Math.round((p2.length / p1.length) * 100);
        bar.style.width = `${percent}%`;
        bar.classList.add("is-matching");
        badgeEl.classList.add("badge-match-primary");
        p2Input.style.borderColor = "var(--primary)";
        p2Input.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
        statusEl.innerHTML = `<span style="color:var(--primary);display:inline-flex;align-items:center;gap:4px">${Icons.check} Karakter cocok sejauh ini (${p2.length}/${p1.length})</span>`;
        badgeEl.textContent = `${percent}% Cocok`;
        return;
      }

      // Kondisi 6: Tidak cocok (salah ketik pada karakter tertentu atau panjang berlebih)
      let matchedCount = 0;
      while (
        matchedCount < p2.length &&
        matchedCount < p1.length &&
        p1[matchedCount] === p2[matchedCount]
      ) {
        matchedCount++;
      }

      const failPercent = Math.min(
        100,
        Math.round((p2.length / p1.length) * 100),
      );
      bar.style.width = `${Math.max(20, failPercent)}%`;
      bar.classList.add("is-mismatch");
      badgeEl.classList.add("badge-match-danger");
      p2Input.style.borderColor = "var(--danger)";
      p2Input.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.15)";

      if (p2.length > p1.length) {
        statusEl.innerHTML = `<span style="color:var(--danger);display:inline-flex;align-items:center;gap:4px">${Icons.cross} Password lebih panjang (${p2.length} kar vs ${p1.length} kar)</span>`;
        badgeEl.textContent = "Karakter Berlebih";
      } else {
        const mismatchPos = matchedCount + 1;
        statusEl.innerHTML = `<span style="color:var(--danger);display:inline-flex;align-items:center;gap:4px">${Icons.cross} Karakter ke-${mismatchPos} tidak cocok</span>`;
        badgeEl.textContent = "Tidak Cocok";
      }
    };

    if (p1Input) p1Input.addEventListener("input", updatePasswordMatchProgress);
    if (p2Input) p2Input.addEventListener("input", updatePasswordMatchProgress);

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
        const cleanEmail = email.trim().toLowerCase();

        // 1. Buat akun Firebase Auth
        const cred = await auth.createUserWithEmailAndPassword(
          cleanEmail,
          password,
        );

        // 2. Cari apakah admin sudah mendaftarkan siswa dengan email ortu ini
        let autoSiswaIds = [];
        try {
          const siswaSnap = await db
            .collection("siswa")
            .where("ortuEmail", "==", cleanEmail)
            .get();

          if (!siswaSnap.empty) {
            autoSiswaIds = siswaSnap.docs.map((d) => d.id);
            // Update siswa agar langsung terhubung ke UID dan nama ortu
            const batch = db.batch();
            siswaSnap.docs.forEach((doc) => {
              batch.update(doc.ref, {
                ortuId: cred.user.uid,
                ortuNama: nama,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              });
            });
            await batch.commit();
          }
        } catch (linkErr) {
          console.warn("Auto-link siswa saat register gagal:", linkErr);
        }

        // 3. Simpan data profil ke Firestore
        await db
          .collection("users")
          .doc(cred.user.uid)
          .set({
            nama,
            nohp: nohp || "",
            email: cleanEmail,
            role: "ortu",
            siswaIds: autoSiswaIds,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

        // 4. Load profil
        await Auth.loadProfile();

        if (autoSiswaIds.length > 0) {
          Router.toast(
            `Pendaftaran berhasil! Terhubung dengan ${autoSiswaIds.length} data anak.`,
          );
        } else {
          Router.toast("Pendaftaran berhasil! Selamat datang di aplikasi SPP.");
        }
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

/** Toggle tampil/sembunyikan password */
if (typeof window.togglePassword === "undefined") {
  window.togglePassword = function (inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      if (iconEl) iconEl.innerHTML = Icons.eyeOff;
    } else {
      input.type = "password";
      if (iconEl) iconEl.innerHTML = Icons.eye;
    }
  };
}
