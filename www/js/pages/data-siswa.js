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
      <div class="form-group">
        <input type="text" id="search-siswa" placeholder="Cari nama siswa atau NIS...">
      </div>
      <div id="siswa-list"><div class="loading">Memuat data siswa...</div></div>

      <!-- Modal Form Siswa -->
      <div id="modal-siswa" class="modal-overlay hidden">
        <div class="modal" style="max-height:90vh;overflow-y:auto">
          <div class="modal-title" id="modal-siswa-title">Tambah Siswa</div>
          <div id="siswa-form-error" class="form-error" style="margin-bottom:10px"></div>

          <div class="form-group">
            <label>Nama Lengkap Siswa</label>
            <input type="text" id="siswa-nama" placeholder="cth: Budi Santoso">
          </div>
          <div class="form-group">
            <label>NIS</label>
            <input type="text" id="siswa-nis" placeholder="cth: 2024001 (Nomor Induk Siswa)">
          </div>
          <div class="form-group">
            <label>Kelas</label>
            <select id="siswa-kelas" onchange="onKelasChange(this.value)"></select>
            <div id="info-wali-kelas" class="form-hint" style="margin-top:6px"></div>
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select id="siswa-jk">
              <option value="">-- Pilih --</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tahun Masuk</label>
            <input type="number" id="siswa-tahun" placeholder="cth: 2024" min="2000" max="2099">
          </div>

          <!-- Hubungkan ke akun orang tua -->
          <div class="form-group">
            <label>Email Akun Orang Tua / Wali</label>
            <div style="display:flex;gap:8px">
              <input type="email" id="siswa-ortu-email"
                     placeholder="email@contoh.com — email yang dipakai ortu saat daftar"
                     style="flex:1">
              <button class="btn btn-secondary btn-sm"
                      style="white-space:nowrap"
                      onclick="cariAkunOrtu()">Cari</button>
            </div>
            <div id="ortu-search-result" style="margin-top:6px"></div>
            <input type="hidden" id="siswa-ortu-id">
            <input type="hidden" id="siswa-ortu-nama">
          </div>

          <input type="hidden" id="siswa-edit-id">

          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="tutupFormSiswa()">Batal</button>
            <button class="btn btn-primary" id="btn-simpan-siswa" onclick="simpanSiswa()">Simpan</button>
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
      const ortuInfo = s.ortuNama
        ? `<span style="color:var(--success);font-size:11.5px">Wali: ${s.ortuNama}</span>`
        : `<span style="color:var(--warning);font-size:11.5px">Belum terhubung ke ortu</span>`;

      return `
      <div class="list-item">
        <div class="list-item-left">
          <div class="list-item-title">${s.nama}</div>
          <div class="list-item-subtitle">NIS: ${s.nis || "-"} &middot; ${s.kelas || "-"}</div>
          <div>${ortuInfo}</div>
        </div>
        <div class="list-item-right flex gap-8">
          <button class="btn btn-secondary btn-sm" onclick="editSiswa('${s.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="hapusSiswa('${s.id}', '${s.nama}')">Hapus</button>
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

function showFormSiswa(data = null) {
  document.getElementById("siswa-nama").value = data ? data.nama : "";
  document.getElementById("siswa-nis").value = data ? data.nis || "" : "";
  document.getElementById("siswa-kelas").innerHTML = getKelasOptions(data ? data.kelas || "" : "");
  document.getElementById("siswa-jk").value = data ? data.jk || "" : "";
  document.getElementById("siswa-tahun").value = data ? data.tahunMasuk || "" : "";
  document.getElementById("siswa-ortu-email").value = data ? data.ortuEmail || "" : "";
  document.getElementById("siswa-ortu-id").value = data ? data.ortuId || "" : "";
  document.getElementById("siswa-ortu-nama").value = data ? data.ortuNama || "" : "";
  document.getElementById("siswa-edit-id").value = data ? data.id : "";
  document.getElementById("siswa-form-error").textContent = "";
  document.getElementById("modal-siswa-title").textContent = data ? "Edit Siswa" : "Tambah Siswa";

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
    <div style="background:var(--success-light);padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="text-sm font-semibold" style="color:var(--success)">Akun ditemukan</div>
        <div class="text-sm">${user.nama || "-"} &middot; ${user.email || ""}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="hapusLinkOrtu()">${Icons.cross}</button>
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

  const data = {
    nama,
    nis,
    kelas,
    jk,
    tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
    // Relasi ortu — kosong string kalau tidak ada
    ortuId: ortuId || "",
    ortuNama: ortuNama || "",
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
      if (ortuLama && ortuLama !== ortuId) {
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
      if (ortuId) {
        const ortuDoc = await db.collection("users").doc(ortuId).get();
        const idsOrtu = ortuDoc.exists ? ortuDoc.data().siswaIds || [] : [];
        if (!idsOrtu.includes(editId)) idsOrtu.push(editId);
        await db.collection("users").doc(ortuId).update({ siswaIds: idsOrtu });
      }

      Router.toast("Data siswa berhasil diperbarui");
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection("siswa").add(data);

      // Tambahkan siswaId baru ke array siswaIds di profil ortu
      if (ortuId) {
        const ortuDoc = await db.collection("users").doc(ortuId).get();
        const idsOrtu = ortuDoc.exists ? ortuDoc.data().siswaIds || [] : [];
        if (!idsOrtu.includes(docRef.id)) idsOrtu.push(docRef.id);
        await db.collection("users").doc(ortuId).update({ siswaIds: idsOrtu });
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
