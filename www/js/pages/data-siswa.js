/* ============================================================
   Halaman Data Siswa (Admin)
   ============================================================ */

Router.register("data-siswa", {
  title: "Data Siswa",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "showFormSiswa()",
  actionIcon: Icons.plus,

  render() {
    return `
      <div style="position:relative;margin-bottom:14px">
        <input type="text" id="search-siswa" placeholder="Cari nama siswa, NIS, atau kelas..." style="width:100%;padding:12px 14px 12px 38px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14.5px;outline:none;background:#fff">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-secondary);display:flex">
          ${Icons.search}
        </span>
      </div>
      <div id="siswa-list"><div class="loading">Memuat data siswa...</div></div>

      <!-- Modal Form Siswa -->
      <div id="modal-siswa" class="modal-overlay hidden" onclick="if(event.target===this) tutupFormSiswa()">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <div class="modal-title" id="modal-siswa-title">Tambah Siswa</div>
              <div class="modal-subtitle" id="modal-siswa-sub">Lengkapi formulir data siswa di bawah ini</div>
            </div>
            <button type="button" class="modal-close-btn" onclick="tutupFormSiswa()" aria-label="Tutup">
              ${Icons.cross}
            </button>
          </div>

          <div id="siswa-form-error" class="form-error" style="margin-bottom:10px"></div>

          <div class="modal-body-scroll">
            <div class="form-group">
              <label>Nama Lengkap Siswa</label>
              <input type="text" id="siswa-nama" placeholder="cth: Budi Santoso">
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:13.5px;font-weight:600;margin-bottom:6px;color:var(--text)">NIS</label>
                <input type="text" id="siswa-nis" placeholder="cth: 2024001" style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14.5px;outline:none;background:#fff">
              </div>
              <div>
                <label style="display:block;font-size:13.5px;font-weight:600;margin-bottom:6px;color:var(--text)">Tahun Masuk</label>
                <input type="number" id="siswa-tahun" placeholder="cth: 2024" min="2000" max="2099" style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14.5px;outline:none;background:#fff">
              </div>
            </div>

            <div class="form-group">
              <label>Kelas</label>
              <div class="custom-select-box" id="box-siswa-kelas" onclick="ClassPicker.open('siswa-kelas', onKelasChange)">
                <span id="text-siswa-kelas" class="placeholder">-- Pilih Kelas --</span>
                <span class="select-chevron">${Icons.chevronDown}</span>
              </div>
              <input type="hidden" id="siswa-kelas" value="">
              <div id="info-wali-kelas" class="form-hint" style="margin-top:6px"></div>
            </div>

            <div class="form-group">
              <label>Jenis Kelamin</label>
              <div class="gender-segmented-control">
                <button type="button" class="gender-btn" id="btn-jk-L" onclick="pilihJK('L')">Laki-laki</button>
                <button type="button" class="gender-btn" id="btn-jk-P" onclick="pilihJK('P')">Perempuan</button>
              </div>
              <input type="hidden" id="siswa-jk" value="">
            </div>

            <!-- Hubungkan ke akun orang tua -->
            <div style="background:#f8fafc;border:1px dashed var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:13px;font-weight:700;color:var(--text)">Akun Orang Tua / Wali</span>
                <span style="font-size:11px;color:var(--text-secondary);background:#e2e8f0;padding:2px 8px;border-radius:10px">Opsional</span>
              </div>
              <div style="font-size:11.5px;color:var(--text-secondary);margin-bottom:10px">
                Hubungkan dengan email akun orang tua yang terdaftar di aplikasi
              </div>
              <div style="display:flex;gap:8px">
                <input type="email" id="siswa-ortu-email"
                       placeholder="email@contoh.com"
                       style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13.5px;outline:none;background:#fff"
                       onkeypress="if(event.key==='Enter'){event.preventDefault();cariAkunOrtu();}">
                <button type="button" class="btn btn-secondary btn-sm"
                        style="white-space:nowrap;padding:0 14px;font-weight:600"
                        onclick="cariAkunOrtu()">Cari</button>
              </div>
              <div id="ortu-search-result" style="margin-top:8px"></div>
              <input type="hidden" id="siswa-ortu-id">
              <input type="hidden" id="siswa-ortu-nama">
            </div>

            <input type="hidden" id="siswa-edit-id">
          </div>

          <div class="modal-actions" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
            <button type="button" class="btn btn-secondary" onclick="tutupFormSiswa()">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-simpan-siswa" onclick="simpanSiswa()">Simpan Siswa</button>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    await loadDaftarSiswa();
    document
      .getElementById("search-siswa")
      .addEventListener("input", function () {
        filterSiswa(this.value.trim().toLowerCase());
      });
  },
});

let _siswaCached = [];

async function loadDaftarSiswa() {
  Helpers.loading("siswa-list");
  try {
    const snap = await db.collection("siswa").orderBy("nama").get();

    if (snap.empty) {
      Helpers.emptyState(
        "siswa-list",
        Icons.students,
        "Belum ada data siswa. Klik tambah untuk membuat data baru.",
      );
      _siswaCached = [];
      return;
    }

    _siswaCached = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderDaftarSiswa(_siswaCached);
  } catch (err) {
    console.error(err);
    Helpers.errorState("siswa-list", "Gagal memuat data: " + err.message);
  }
}

function renderDaftarSiswa(list) {
  const container = document.getElementById("siswa-list");
  if (!container) return;

  if (list.length === 0) {
    Helpers.emptyState("siswa-list", Icons.search, "Tidak ada data siswa yang cocok");
    return;
  }

  container.innerHTML = list
    .map((s) => {
      const initial = s.nama ? s.nama.charAt(0).toUpperCase() : "S";
      const ortuBadge = s.ortuNama
        ? `<span class="badge-soft badge-soft-success">Wali: ${s.ortuNama}</span>`
        : `<span class="badge-soft badge-soft-warning">Belum terhubung ortu</span>`;

      return `
      <div class="siswa-card">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
          <div class="siswa-avatar">${initial}</div>
          <div style="min-width:0;flex:1">
            <div style="font-weight:700;font-size:14.5px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${s.nama}
            </div>
            <div style="font-size:12px;color:var(--text-secondary);margin:2px 0 4px">
              NIS: <strong>${s.nis || "-"}</strong> &middot; Kelas: <span class="badge-kelas">${s.kelas || "-"}</span>
            </div>
            <div>${ortuBadge}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button type="button" class="btn btn-secondary btn-sm" style="padding:6px 12px;font-size:12px" onclick="editSiswa('${s.id}')">
            Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm" style="padding:6px 12px;font-size:12px" onclick="hapusSiswa('${s.id}', '${s.nama}')">
            Hapus
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

function filterSiswa(keyword) {
  if (!keyword) {
    renderDaftarSiswa(_siswaCached);
    return;
  }
  const filtered = _siswaCached.filter(
    (s) =>
      s.nama.toLowerCase().includes(keyword) ||
      (s.nis && s.nis.toLowerCase().includes(keyword)) ||
      (s.kelas && s.kelas.toLowerCase().includes(keyword)),
  );
  renderDaftarSiswa(filtered);
}

function pilihJK(jk) {
  const hiddenInput = document.getElementById("siswa-jk");
  if (hiddenInput) hiddenInput.value = jk || "";
  const btnL = document.getElementById("btn-jk-L");
  const btnP = document.getElementById("btn-jk-P");
  if (btnL && btnP) {
    if (jk === "L") {
      btnL.classList.add("active");
      btnP.classList.remove("active");
    } else if (jk === "P") {
      btnP.classList.add("active");
      btnL.classList.remove("active");
    } else {
      btnL.classList.remove("active");
      btnP.classList.remove("active");
    }
  }
}

function showFormSiswa(data = null) {
  document.getElementById("siswa-nama").value = data ? data.nama : "";
  document.getElementById("siswa-nis").value = data ? data.nis || "" : "";
  ClassPicker.setValue("siswa-kelas", data ? data.kelas || "" : "");
  pilihJK(data ? data.jk || "" : "");
  document.getElementById("siswa-tahun").value = data ? data.tahunMasuk || "" : "";
  document.getElementById("siswa-ortu-email").value = data ? data.ortuEmail || "" : "";
  document.getElementById("siswa-ortu-id").value = data ? data.ortuId || "" : "";
  document.getElementById("siswa-ortu-nama").value = data ? data.ortuNama || "" : "";
  document.getElementById("siswa-edit-id").value = data ? data.id : "";
  document.getElementById("siswa-form-error").textContent = "";
  document.getElementById("modal-siswa-title").textContent = data ? "Edit Siswa" : "Tambah Siswa";
  document.getElementById("modal-siswa-sub").textContent = data ? "Perbarui informasi data siswa" : "Lengkapi formulir data siswa di bawah ini";

  // Tampilkan wali kelas otomatis
  if (data && data.kelas) onKelasChange(data.kelas);
  else document.getElementById("info-wali-kelas").textContent = "";

  // Tampilkan info ortu kalau sudah terhubung
  const resultEl = document.getElementById("ortu-search-result");
  if (data && data.ortuNama) {
    resultEl.innerHTML = renderOrtuFound({
      uid: data.ortuId,
      nama: data.ortuNama,
      email: data.ortuEmail,
    });
  } else {
    resultEl.innerHTML = "";
  }

  document.getElementById("modal-siswa").classList.remove("hidden");
}

function tutupFormSiswa() {
  document.getElementById("modal-siswa").classList.add("hidden");
}

function editSiswa(id) {
  const siswa = _siswaCached.find((s) => s.id === id);
  if (siswa) showFormSiswa(siswa);
}

/** Cari akun ortu berdasarkan email */
async function cariAkunOrtu() {
  const email = document
    .getElementById("siswa-ortu-email")
    .value.trim()
    .toLowerCase();
  const resultEl = document.getElementById("ortu-search-result");
  const errEl = document.getElementById("siswa-form-error");

  if (!email) {
    errEl.textContent = "Masukkan email orang tua terlebih dahulu";
    return;
  }

  if (!Helpers.isValidEmail(email)) {
    errEl.textContent = "Format email tidak valid";
    return;
  }

  resultEl.innerHTML = `<div class="text-sm text-secondary">Mencari akun...</div>`;
  errEl.textContent = "";

  try {
    // Cari user dengan email ini di koleksi 'users' dengan role 'ortu'
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .where("role", "==", "ortu")
      .get();

    if (snap.empty) {
      // Coba tanpa filter role (mungkin belum set role)
      const snap2 = await db
        .collection("users")
        .where("email", "==", email)
        .get();
      if (snap2.empty) {
        resultEl.innerHTML = `<div class="text-sm" style="color:var(--danger)">Akun dengan email ini tidak ditemukan. Pastikan orang tua sudah mendaftar.</div>`;
        document.getElementById("siswa-ortu-id").value = "";
        document.getElementById("siswa-ortu-nama").value = "";
        return;
      }
      const user = { uid: snap2.docs[0].id, ...snap2.docs[0].data() };
      pilihOrtu(user);
      resultEl.innerHTML = renderOrtuFound(user);
    } else {
      const user = { uid: snap.docs[0].id, ...snap.docs[0].data() };
      pilihOrtu(user);
      resultEl.innerHTML = renderOrtuFound(user);
    }
  } catch (err) {
    resultEl.innerHTML = `<div class="text-sm" style="color:var(--danger)">Gagal mencari: ${err.message}</div>`;
  }
}

function pilihOrtu(user) {
  document.getElementById("siswa-ortu-id").value = user.uid;
  document.getElementById("siswa-ortu-nama").value = user.nama || "";
}

function renderOrtuFound(user) {
  return `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <div style="width:30px;height:30px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${Icons.check}
        </div>
        <div style="min-width:0">
          <div style="font-weight:700;font-size:13px;color:#15803d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.nama || "Orang Tua"}</div>
          <div style="font-size:11.5px;color:#166534;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.email || ""}</div>
        </div>
      </div>
      <button type="button" class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:5px 10px;font-size:11.5px;font-weight:600;flex-shrink:0" onclick="hapusLinkOrtu()">
        Lepas
      </button>
    </div>
  `;
}

function hapusLinkOrtu() {
  document.getElementById("siswa-ortu-id").value = "";
  document.getElementById("siswa-ortu-nama").value = "";
  document.getElementById("siswa-ortu-email").value = "";
  document.getElementById("ortu-search-result").innerHTML = "";
}

async function simpanSiswa() {
  const nama = document.getElementById("siswa-nama").value.trim();
  const nis = document.getElementById("siswa-nis").value.trim();
  const kelas = document.getElementById("siswa-kelas").value;
  const jk = document.getElementById("siswa-jk").value;
  const tahunMasuk = document.getElementById("siswa-tahun").value.trim();
  const ortuId = document.getElementById("siswa-ortu-id").value;
  const ortuNama = document.getElementById("siswa-ortu-nama").value;
  const ortuEmail = document.getElementById("siswa-ortu-email").value.trim();
  const editId = document.getElementById("siswa-edit-id").value;
  const errEl = document.getElementById("siswa-form-error");

  // Validasi wajib
  if (!nama) {
    errEl.textContent = "Nama siswa wajib diisi";
    return;
  }
  if (!nis) {
    errEl.textContent = "NIS wajib diisi";
    return;
  }
  if (!kelas) {
    errEl.textContent = "Kelas wajib dipilih";
    return;
  }
  if (!jk) {
    errEl.textContent = "Jenis kelamin wajib dipilih";
    return;
  }

  // Cek NIS duplikat
  const dupSnap = await db.collection("siswa").where("nis", "==", nis).get();
  const isDuplikat = dupSnap.docs.some((doc) => doc.id !== editId);
  if (isDuplikat) {
    errEl.textContent = "NIS sudah terdaftar";
    return;
  }

  Helpers.btnLoading("btn-simpan-siswa", "Menyimpan...");

  let finalOrtuId = ortuId || "";
  let finalOrtuNama = ortuNama || "";

  // Auto-resolve ortu jika email diisi tapi tombol Cari belum diklik
  if (!finalOrtuId && ortuEmail) {
    try {
      const snapOrtu = await db
        .collection("users")
        .where("email", "==", ortuEmail.toLowerCase())
        .get();
      if (!snapOrtu.empty) {
        finalOrtuId = snapOrtu.docs[0].id;
        finalOrtuNama = snapOrtu.docs[0].data().nama || "";
      }
    } catch (e) {
      console.warn("Auto-resolve ortu gagal:", e);
    }
  }

  const data = {
    nama,
    nis,
    kelas,
    jk,
    tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
    // Relasi ortu — kosong string kalau tidak ada
    ortuId: finalOrtuId,
    ortuNama: finalOrtuNama,
    ortuEmail: ortuEmail || "",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    if (editId) {
      await db.collection("siswa").doc(editId).update(data);

      // Cek apakah ortu berubah
      const siswaLama = _siswaCached.find((s) => s.id === editId);
      const ortuLama = siswaLama ? siswaLama.ortuId : null;

      // Kalau ortu lama berbeda → cabut siswaId dari ortu lama
      if (ortuLama && ortuLama !== finalOrtuId) {
        const ortuLamaDoc = await db.collection("users").doc(ortuLama).get();
        if (ortuLamaDoc.exists) {
          const idsLama = ortuLamaDoc.data().siswaIds || [];
          await db
            .collection("users")
            .doc(ortuLama)
            .update({
              siswaIds: idsLama.filter((id) => id !== editId),
            });
        }
      }

      // Tambahkan ke siswaIds ortu baru (kalau ada)
      if (finalOrtuId) {
        const ortuDoc = await db.collection("users").doc(finalOrtuId).get();
        const idsOrtu = ortuDoc.exists ? ortuDoc.data().siswaIds || [] : [];
        if (!idsOrtu.includes(editId)) idsOrtu.push(editId);
        await db.collection("users").doc(finalOrtuId).update({ siswaIds: idsOrtu });
      }

      Router.toast("Data siswa berhasil diperbarui");
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection("siswa").add(data);

      // Tambahkan siswaId baru ke array siswaIds di profil ortu
      if (finalOrtuId) {
        const ortuDoc = await db.collection("users").doc(finalOrtuId).get();
        const idsOrtu = ortuDoc.exists ? ortuDoc.data().siswaIds || [] : [];
        if (!idsOrtu.includes(docRef.id)) idsOrtu.push(docRef.id);
        await db.collection("users").doc(finalOrtuId).update({ siswaIds: idsOrtu });
      }

      Router.toast("Siswa berhasil ditambahkan");
    }

    tutupFormSiswa();
    await loadDaftarSiswa();
  } catch (err) {
    console.error(err);
    errEl.textContent = "Gagal menyimpan: " + err.message;
  } finally {
    Helpers.btnReset("btn-simpan-siswa");
  }
}

async function hapusSiswa(id, nama) {
  const ok = await Helpers.confirm(
    `Hapus siswa "${nama}"? Data tagihan terkait tidak akan ikut terhapus.`,
  );
  if (!ok) return;

  try {
    // Cabut dari siswaIds ortu kalau ada
    const siswa = _siswaCached.find(s => s.id === id);
    if (siswa && siswa.ortuId) {
      const ortuDoc = await db.collection("users").doc(siswa.ortuId).get();
      if (ortuDoc.exists) {
        const idsOrtu = ortuDoc.data().siswaIds || [];
        await db.collection("users").doc(siswa.ortuId).update({
          siswaIds: idsOrtu.filter(x => x !== id)
        });
      }
    }

    await db.collection("siswa").doc(id).delete();
    Router.toast("Siswa berhasil dihapus");
    await loadDaftarSiswa();
  } catch (err) {
    Router.toast("Gagal menghapus: " + err.message);
  }
}

/** Tampilkan wali kelas otomatis saat kelas dipilih */
async function onKelasChange(kelas) {
  const infoEl = document.getElementById("info-wali-kelas");
  if (!infoEl) return;
  if (!kelas) { infoEl.textContent = ""; return; }

  infoEl.textContent = "Mencari wali kelas...";
  const wali = await getWaliByKelas(kelas);
  if (wali) {
    infoEl.innerHTML = `Wali Kelas: <strong>${wali.namaWali}</strong>${wali.noHp ? " &middot; " + wali.noHp : ""}`;
    infoEl.style.color = "var(--success)";
  } else {
    infoEl.textContent = "Wali kelas belum diatur untuk kelas ini";
    infoEl.style.color = "var(--warning)";
  }
}
