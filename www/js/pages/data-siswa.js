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
      <!-- Toolbar Aksi Siswa (Import & Export Excel) -->
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="btn btn-secondary btn-sm" onclick="showModalImportSiswa()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
            ${Icons.receipt} Import Excel
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="exportDataSiswaExcel()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
            ${Icons.fileText} Export Data Siswa
          </button>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="showFormSiswa()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
          ${Icons.plus} Tambah Siswa
        </button>
      </div>

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

      <!-- Modal Import Excel Siswa -->
      <div id="modal-import-siswa" class="modal-overlay hidden" onclick="if(event.target===this) tutupModalImportSiswa()">
        <div class="modal" onclick="event.stopPropagation()" style="max-height:92vh;overflow-y:auto;max-width:680px">
          <div class="modal-header">
            <div>
              <div class="modal-title">Import Data Siswa dari Excel</div>
              <div class="modal-subtitle">Unggah berkas spreadsheet (.xlsx / .csv) untuk input siswa massal</div>
            </div>
            <button type="button" class="modal-close-btn" onclick="tutupModalImportSiswa()" aria-label="Tutup">
              ${Icons.cross}
            </button>
          </div>

          <div style="margin-bottom:14px">
            <div class="card" style="background:#f8fafc;border:1px solid var(--border);padding:14px;margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <div>
                  <div class="font-bold text-sm">Unduh Template Excel</div>
                  <div class="text-xs text-secondary">Kolom: Nama, NIS, Kelas, Jenis Kelamin (L/P), Tahun Masuk</div>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="downloadTemplateImportSiswa()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
                  ${Icons.receipt} Unduh Template
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Pilih File Excel / CSV (.xlsx, .xls, .csv)</label>
              <input type="file" id="input-file-excel-siswa" accept=".xlsx, .xls, .csv" onchange="handleExcelSiswaFile(event)" style="padding:10px;border:1px dashed var(--primary);border-radius:8px;width:100%;background:#f0f7ff">
              <div class="form-hint">Format kolom harus sesuai template di atas</div>
            </div>

            <!-- Preview Data & Validasi Status -->
            <div id="import-siswa-preview-wrapper" style="display:none;margin-top:14px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">
                <div class="font-bold text-sm">Preview Data Siswa:</div>
                <div id="import-siswa-stats" style="display:flex;gap:6px"></div>
              </div>
              <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
                <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left">
                  <thead style="background:#f1f5f9;position:sticky;top:0;font-weight:700">
                    <tr>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">No</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">Nama</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">NIS</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">Kelas</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">JK</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">Tahun</th>
                      <th style="padding:8px 10px;border-bottom:1px solid var(--border)">Validasi</th>
                    </tr>
                  </thead>
                  <tbody id="import-siswa-table-body"></tbody>
                </table>
              </div>
            </div>

            <!-- Progress Box saat Import -->
            <div id="import-siswa-progress" style="display:none;margin-top:10px">
              <div class="text-sm text-secondary mb-4" id="import-siswa-progress-text">Memproses penyimpanan siswa...</div>
              <div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden">
                <div id="import-siswa-progress-bar" style="background:var(--primary);height:8px;width:0%;transition:width 0.2s"></div>
              </div>
            </div>

            <!-- Ringkasan Hasil Import -->
            <div id="import-siswa-summary" style="display:none;margin-top:12px"></div>
          </div>

          <div class="modal-actions" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
            <button type="button" class="btn btn-secondary" onclick="tutupModalImportSiswa()">Tutup</button>
            <button type="button" class="btn btn-primary" id="btn-konfirmasi-import-siswa" onclick="konfirmasiImportSiswa()" style="display:none">
              Konfirmasi Import
            </button>
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
  const walis = (typeof getSemuaWaliByKelas === "function") 
    ? await getSemuaWaliByKelas(kelas) 
    : [await getWaliByKelas(kelas)].filter(Boolean);

  if (walis.length > 0) {
    const names = walis.map((w) => `<strong>${w.namaWali}</strong>${w.noHp ? " (" + w.noHp + ")" : ""}`).join(" &bull; ");
    infoEl.innerHTML = `Wali Kelas: ${names}`;
    infoEl.style.color = "var(--success)";
  } else {
    infoEl.textContent = "Wali kelas belum diatur untuk kelas ini";
    infoEl.style.color = "var(--warning)";
  }
}

/* ============================================================
   Import & Export Excel Data Siswa (SheetJS)
   ============================================================ */

let _importedSiswaRows = [];

function showModalImportSiswa() {
  _importedSiswaRows = [];
  const fileInput = document.getElementById("input-file-excel-siswa");
  if (fileInput) fileInput.value = "";
  const previewWrapper = document.getElementById("import-siswa-preview-wrapper");
  if (previewWrapper) previewWrapper.style.display = "none";
  const progressBox = document.getElementById("import-siswa-progress");
  if (progressBox) progressBox.style.display = "none";
  const summaryBox = document.getElementById("import-siswa-summary");
  if (summaryBox) {
    summaryBox.innerHTML = "";
    summaryBox.style.display = "none";
  }
  const btnKonfirmasi = document.getElementById("btn-konfirmasi-import-siswa");
  if (btnKonfirmasi) btnKonfirmasi.style.display = "none";

  const modal = document.getElementById("modal-import-siswa");
  if (modal) modal.classList.remove("hidden");
}

function tutupModalImportSiswa() {
  const modal = document.getElementById("modal-import-siswa");
  if (modal) modal.classList.add("hidden");
}

function downloadTemplateImportSiswa() {
  if (typeof XLSX === "undefined") {
    Router.toast("Library SheetJS belum termuat. Coba refresh halaman.");
    return;
  }

  const contoh = [
    {
      "Nama": "Ahmad Dani",
      "NIS": "2026001",
      "Kelas": "SD 1A",
      "Jenis Kelamin": "L",
      "Tahun Masuk": 2026,
    },
    {
      "Nama": "Siti Nurhaliza",
      "NIS": "2026002",
      "Kelas": "SD 1B",
      "Jenis Kelamin": "P",
      "Tahun Masuk": 2026,
    },
    {
      "Nama": "Kevin Pratama",
      "NIS": "2026003",
      "Kelas": "SMP 1A",
      "Jenis Kelamin": "L",
      "Tahun Masuk": 2026,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(contoh, {
    header: ["Nama", "NIS", "Kelas", "Jenis Kelamin", "Tahun Masuk"],
  });
  ws["!cols"] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
  XLSX.writeFile(wb, "template-siswa-charispay.xlsx");
}

function handleExcelSiswaFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (typeof XLSX === "undefined") {
    Router.toast("Library SheetJS belum termuat.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rawJson || rawJson.length === 0) {
        Router.toast("File kosong atau format tidak sesuai.");
        return;
      }

      processImportedSiswaData(rawJson);
    } catch (err) {
      console.error("Gagal membaca Excel:", err);
      Router.toast("Format file gagal dibaca: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function processImportedSiswaData(rows) {
  const validList = typeof DAFTAR_KELAS !== "undefined" ? DAFTAR_KELAS : [];
  _importedSiswaRows = [];

  let validCount = 0;
  let errorCount = 0;

  const tableBody = document.getElementById("import-siswa-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  rows.forEach((row, idx) => {
    // Normalisasi kolom
    const nama = String(
      row["Nama"] || row["nama"] || row["NAMA"] || row["Nama Siswa"] || "",
    ).trim();
    const nis = String(
      row["NIS"] || row["nis"] || row["Nis"] || "",
    ).trim();
    const kelas = String(
      row["Kelas"] || row["kelas"] || row["KELAS"] || "",
    ).trim();

    let jkRaw = String(
      row["Jenis Kelamin"] ||
        row["JenisKelamin"] ||
        row["JK"] ||
        row["jk"] ||
        row["Gender"] ||
        "",
    ).trim().toUpperCase();

    if (jkRaw === "LAKI-LAKI" || jkRaw === "PRIA" || jkRaw === "LAKILAKI")
      jkRaw = "L";
    if (jkRaw === "PEREMPUAN" || jkRaw === "WANITA") jkRaw = "P";

    const tahunMasuk =
      parseInt(
        row["Tahun Masuk"] || row["TahunMasuk"] || row["Tahun"] || row["tahun"],
      ) || new Date().getFullYear();

    // Validasi
    const errors = [];
    if (!nama) errors.push("Nama wajib");
    if (!nis) errors.push("NIS wajib");
    if (!kelas || !validList.includes(kelas)) {
      errors.push("Kelas tidak valid");
    }
    if (jkRaw !== "L" && jkRaw !== "P") {
      errors.push("JK harus L atau P");
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else errorCount++;

    const item = {
      no: idx + 1,
      nama,
      nis,
      kelas,
      jenisKelamin: jkRaw,
      tahunMasuk,
      isValid,
      errors,
    };
    _importedSiswaRows.push(item);

    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-light)";
    tr.style.background = isValid ? "#ffffff" : "#fff5f5";
    tr.innerHTML = `
      <td style="padding:6px 10px;font-weight:600">${idx + 1}</td>
      <td style="padding:6px 10px;font-weight:600">${nama || '<span style="color:var(--danger)">(Kosong)</span>'}</td>
      <td style="padding:6px 10px">${nis || '<span style="color:var(--danger)">(Kosong)</span>'}</td>
      <td style="padding:6px 10px">${kelas || '<span style="color:var(--danger)">(Kosong)</span>'}</td>
      <td style="padding:6px 10px">${jkRaw || "-"}</td>
      <td style="padding:6px 10px">${tahunMasuk}</td>
      <td style="padding:6px 10px">
        ${
          isValid
            ? `<span class="badge badge-lunas" style="font-size:10.5px">Valid</span>`
            : `<span class="badge badge-ditolak" style="font-size:10.5px" title="${errors.join(", ")}">${errors.join(", ")}</span>`
        }
      </td>
    `;
    tableBody.appendChild(tr);
  });

  const statsEl = document.getElementById("import-siswa-stats");
  if (statsEl) {
    statsEl.innerHTML = `
      <span class="badge badge-lunas">${validCount} Baris Valid</span>
      <span class="badge ${errorCount > 0 ? "badge-ditolak" : "badge-belum"}">${errorCount} Baris Error</span>
    `;
  }

  const previewWrapper = document.getElementById("import-siswa-preview-wrapper");
  if (previewWrapper) previewWrapper.style.display = "block";

  const btnKonfirmasi = document.getElementById("btn-konfirmasi-import-siswa");
  if (btnKonfirmasi) {
    btnKonfirmasi.style.display = validCount > 0 ? "inline-flex" : "none";
    btnKonfirmasi.textContent = `Konfirmasi Import (${validCount} Siswa)`;
  }
}

async function konfirmasiImportSiswa() {
  const validItems = _importedSiswaRows.filter((r) => r.isValid);
  if (validItems.length === 0) {
    Router.toast("Tidak ada baris data valid untuk diimport");
    return;
  }

  const ok = await Helpers.confirm(
    `Import ${validItems.length} data siswa valid ke database? Data dengan NIS yang sudah ada akan dilewati otomatis.`,
  );
  if (!ok) return;

  Helpers.btnLoading("btn-konfirmasi-import-siswa", "Menyimpan...");
  const progressBox = document.getElementById("import-siswa-progress");
  const progressBar = document.getElementById("import-siswa-progress-bar");
  const progressText = document.getElementById("import-siswa-progress-text");
  const summaryBox = document.getElementById("import-siswa-summary");

  if (progressBox) progressBox.style.display = "block";
  if (summaryBox) summaryBox.style.display = "none";

  try {
    // 1. Ambil seluruh data siswa untuk cek duplikasi NIS
    const snap = await db.collection("siswa").get();
    const existingNisSet = new Set(
      snap.docs.map((d) => String(d.data().nis || "").trim()),
    );

    let berhasil = 0;
    let diSkip = 0;
    let gagal = 0;

    // Filter duplikat baik dengan Firestore maupun di dalam file sendiri
    const toInsert = [];
    const localNisSeen = new Set();

    validItems.forEach((item) => {
      if (existingNisSet.has(item.nis) || localNisSeen.has(item.nis)) {
        diSkip++;
      } else {
        toInsert.push(item);
        localNisSeen.add(item.nis);
      }
    });

    // 2. Batch write ke Firestore (max 450 per batch)
    const BATCH_SIZE = 450;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const chunk = toInsert.slice(i, i + BATCH_SIZE);
      const batch = db.batch();

      chunk.forEach((s) => {
        const docRef = db.collection("siswa").doc();
        batch.set(docRef, {
          nama: s.nama,
          nis: s.nis,
          kelas: s.kelas,
          jk: s.jenisKelamin,
          jenisKelamin: s.jenisKelamin,
          tahunMasuk: s.tahunMasuk,
          ortuId: "",
          ortuNama: "",
          ortuEmail: "",
          ortuNoHp: "",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      try {
        await batch.commit();
        berhasil += chunk.length;
      } catch (batchErr) {
        console.error("Batch error:", batchErr);
        gagal += chunk.length;
      }

      if (progressBar && progressText) {
        const pct = Math.round((berhasil / (toInsert.length || 1)) * 100);
        progressBar.style.width = pct + "%";
        progressText.textContent = `Menyimpan data... ${berhasil} dari ${toInsert.length} tersimpan`;
      }
    }

    if (progressBox) progressBox.style.display = "none";

    // 3. Tampilkan ringkasan
    if (summaryBox) {
      summaryBox.style.display = "block";
      summaryBox.innerHTML = `
        <div class="card" style="background:#f0fdf4;border-color:#bbf7d0;padding:14px">
          <div class="font-bold text-sm" style="color:var(--success-dark)">Proses Import Selesai</div>
          <div class="text-xs text-secondary mt-4">
            &bull; Berhasil disimpan: <strong>${berhasil} siswa</strong><br>
            &bull; Dilewati / Duplikat NIS: <strong>${diSkip} siswa</strong><br>
            &bull; Baris Gagal / Error: <strong>${gagal + (_importedSiswaRows.length - validItems.length)} baris</strong>
          </div>
        </div>
      `;
    }

    Router.toast(
      `Import selesai: Berhasil ${berhasil}, Di-skip ${diSkip}, Gagal ${gagal}`,
    );
    await loadDaftarSiswa();
  } catch (err) {
    console.error("Import error:", err);
    Router.toast("Import gagal: " + err.message);
  } finally {
    Helpers.btnReset("btn-konfirmasi-import-siswa");
  }
}

async function exportDataSiswaExcel() {
  if (typeof XLSX === "undefined") {
    Router.toast("Library SheetJS belum termuat. Periksa koneksi internet.");
    return;
  }

  Router.toast("Menyiapkan data siswa...");
  try {
    const snap = await db.collection("siswa").orderBy("nama").get();
    if (snap.empty) {
      Router.toast("Belum ada data siswa untuk diexport");
      return;
    }

    const rows = snap.docs.map((d) => {
      const s = d.data();
      const jk =
        s.jenisKelamin || s.jk === "L"
          ? "L"
          : s.jk === "P"
          ? "P"
          : s.jenisKelamin || "-";
      return {
        "Nama": s.nama || "-",
        "NIS": s.nis || "-",
        "Kelas": s.kelas || "-",
        "Jenis Kelamin": jk,
        "Tahun Masuk": s.tahunMasuk || "-",
        "Nama Ortu": s.ortuNama || "-",
        "Email Ortu": s.ortuEmail || "-",
        "No HP Ortu": s.ortuNoHp || s.nohp || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Nama",
        "NIS",
        "Kelas",
        "Jenis Kelamin",
        "Tahun Masuk",
        "Nama Ortu",
        "Email Ortu",
        "No HP Ortu",
      ],
    });

    ws["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 26 },
      { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, "data-siswa.xlsx");
    Router.toast("File data-siswa.xlsx berhasil diunduh");
  } catch (err) {
    console.error("Export Siswa error:", err);
    Router.toast("Gagal export siswa: " + err.message);
  }
}
