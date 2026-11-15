/* ============================================================
   Halaman Edit Profil
   ============================================================
   Dipakai oleh ortu maupun admin.
   Edit nama, no HP, email, dan password.
   ============================================================ */

Router.register("profil", {
    title: "Edit Profil",
    back: true,
    nav: false,
    requireAuth: true,

    render() {
        const p    = Auth.profile || {};
        const user = Auth.user || {};
        return `
            <div class="card">
                <!-- Avatar inisial -->
                <div style="text-align:center;margin-bottom:16px">
                    <div style="
                        width:72px;height:72px;border-radius:50%;
                        background:var(--primary);color:white;
                        display:flex;align-items:center;justify-content:center;
                        font-size:28px;font-weight:700;margin:0 auto 8px
                    ">${(p.nama || "U").charAt(0).toUpperCase()}</div>
                    <div class="font-semibold">${p.nama || "-"}</div>
                    <div class="text-sm text-secondary">${user.email || ""}</div>
                </div>
            </div>

            <!-- Form Data Diri -->
            <div class="card">
                <div class="card-title">Data Diri</div>
                <div id="profil-error" class="form-error" style="margin-bottom:10px"></div>
                <div id="profil-success" style="color:var(--success);font-size:13px;margin-bottom:10px"></div>

                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="profil-nama"
                           value="${p.nama || ""}"
                           placeholder="Nama lengkap Anda">
                </div>
                <div class="form-group">
                    <label>Nomor HP / WhatsApp</label>
                    <input type="tel" id="profil-nohp"
                           value="${p.nohp || ""}"
                           placeholder="cth: 081234567890">
                </div>

                <button class="btn btn-primary" id="btn-simpan-profil"
                        onclick="simpanProfil()">
                    Simpan Perubahan
                </button>
            </div>

            <!-- Ganti Email -->
            <div class="card">
                <div class="card-title">Ganti Email</div>
                <p class="text-sm text-secondary mb-16">
                    Butuh konfirmasi password untuk ganti email.
                </p>
                <div id="email-error" class="form-error" style="margin-bottom:10px"></div>
                <div id="email-success" style="color:var(--success);font-size:13px;margin-bottom:10px"></div>

                <div class="form-group">
                    <label>Email Baru</label>
                    <input type="email" id="profil-email-baru"
                           placeholder="email@contoh.com">
                </div>
                <div class="form-group">
                    <label>Konfirmasi Password Saat Ini</label>
                    <input type="password" id="profil-password-konfirm"
                           placeholder="Masukkan password Anda">
                </div>

                <button class="btn btn-secondary" id="btn-ganti-email"
                        onclick="gantiEmail()">
                    Ganti Email
                </button>
            </div>

            <!-- Ganti Password -->
            <div class="card">
                <div class="card-title">Ganti Password</div>
                <div id="password-error" class="form-error" style="margin-bottom:10px"></div>
                <div id="password-success" style="color:var(--success);font-size:13px;margin-bottom:10px"></div>

                <div class="form-group">
                    <label>Password Lama</label>
                    <input type="password" id="profil-password-lama"
                           placeholder="Masukkan password lama">
                </div>
                <div class="form-group">
                    <label>Password Baru</label>
                    <input type="password" id="profil-password-baru"
                           placeholder="Minimal 6 karakter">
                </div>
                <div class="form-group">
                    <label>Konfirmasi Password Baru</label>
                    <input type="password" id="profil-password-baru2"
                           placeholder="Ketik ulang password baru">
                </div>

                <button class="btn btn-secondary" id="btn-ganti-password"
                        onclick="gantiPassword()">
                    Ganti Password
                </button>
            </div>
        `;
    },

    init() {
        // Tidak ada init khusus
    }
});

/* ============================================================
   Simpan Nama & No HP
   ============================================================ */
async function simpanProfil() {
    const nama  = document.getElementById("profil-nama").value.trim();
    const nohp  = document.getElementById("profil-nohp").value.trim();
    const errEl = document.getElementById("profil-error");
    const okEl  = document.getElementById("profil-success");
    errEl.textContent = "";
    okEl.textContent  = "";

    if (!nama) { errEl.textContent = "Nama tidak boleh kosong"; return; }

    Helpers.btnLoading("btn-simpan-profil", "Menyimpan...");
    try {
        await db.collection("users").doc(Auth.getUid()).update({
            nama, nohp: nohp || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update cache profil lokal
        Auth.profile.nama  = nama;
        Auth.profile.nohp  = nohp;

        okEl.textContent = "✅ Profil berhasil disimpan";
        Router.toast("Profil berhasil diperbarui");
    } catch (err) {
        errEl.textContent = "Gagal menyimpan: " + err.message;
    } finally {
        Helpers.btnReset("btn-simpan-profil");
    }
}

/* ============================================================
   Ganti Email
   ============================================================ */
async function gantiEmail() {
    const emailBaru  = document.getElementById("profil-email-baru").value.trim();
    const password   = document.getElementById("profil-password-konfirm").value;
    const errEl      = document.getElementById("email-error");
    const okEl       = document.getElementById("email-success");
    errEl.textContent = "";
    okEl.textContent  = "";

    if (!emailBaru)  { errEl.textContent = "Email baru wajib diisi"; return; }
    if (!Helpers.isValidEmail(emailBaru)) {
        errEl.textContent = "Format email tidak valid"; return;
    }
    if (!password) { errEl.textContent = "Password wajib diisi untuk konfirmasi"; return; }

    Helpers.btnLoading("btn-ganti-email", "Memproses...");
    try {
        // Re-authenticate dulu
        const credential = firebase.auth.EmailAuthProvider.credential(
            Auth.user.email, password
        );
        await Auth.user.reauthenticateWithCredential(credential);

        // Update email di Firebase Auth
        await Auth.user.updateEmail(emailBaru);

        // Update email di Firestore
        await db.collection("users").doc(Auth.getUid()).update({
            email: emailBaru,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        Auth.profile.email = emailBaru;
        document.getElementById("profil-email-baru").value = "";
        document.getElementById("profil-password-konfirm").value = "";
        okEl.textContent = "✅ Email berhasil diganti";
        Router.toast("Email berhasil diperbarui");
    } catch (err) {
        if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            errEl.textContent = "Password salah";
        } else if (err.code === "auth/email-already-in-use") {
            errEl.textContent = "Email sudah digunakan akun lain";
        } else {
            errEl.textContent = "Gagal: " + err.message;
        }
    } finally {
        Helpers.btnReset("btn-ganti-email");
    }
}

/* ============================================================
   Ganti Password
   ============================================================ */
async function gantiPassword() {
    const passLama  = document.getElementById("profil-password-lama").value;
    const passBaru  = document.getElementById("profil-password-baru").value;
    const passBaru2 = document.getElementById("profil-password-baru2").value;
    const errEl     = document.getElementById("password-error");
    const okEl      = document.getElementById("password-success");
    errEl.textContent = "";
    okEl.textContent  = "";

    if (!passLama)  { errEl.textContent = "Password lama wajib diisi"; return; }
    if (!passBaru)  { errEl.textContent = "Password baru wajib diisi"; return; }
    if (passBaru.length < 6) {
        errEl.textContent = "Password baru minimal 6 karakter"; return;
    }
    if (passBaru !== passBaru2) {
        errEl.textContent = "Konfirmasi password tidak cocok"; return;
    }
    if (passLama === passBaru) {
        errEl.textContent = "Password baru tidak boleh sama dengan password lama"; return;
    }

    Helpers.btnLoading("btn-ganti-password", "Memproses...");
    try {
        // Re-authenticate
        const credential = firebase.auth.EmailAuthProvider.credential(
            Auth.user.email, passLama
        );
        await Auth.user.reauthenticateWithCredential(credential);

        // Update password
        await Auth.user.updatePassword(passBaru);

        document.getElementById("profil-password-lama").value = "";
        document.getElementById("profil-password-baru").value = "";
        document.getElementById("profil-password-baru2").value = "";
        okEl.textContent = "✅ Password berhasil diganti";
        Router.toast("Password berhasil diperbarui");
    } catch (err) {
        if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            errEl.textContent = "Password lama salah";
        } else {
            errEl.textContent = "Gagal: " + err.message;
        }
    } finally {
        Helpers.btnReset("btn-ganti-password");
    }
}
