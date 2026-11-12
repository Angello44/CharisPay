/* ============================================================
   Halaman Data Siswa (Admin)
   ============================================================ */

Router.register("data-siswa", {
  title: "Data Siswa",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "showFormSiswa()",
  actionIcon: "+",

  render() {
    return `
            <div class="form-group">
                <input type="text" id="search-siswa" placeholder="&#128269; Cari nama / NIS...">
            </div>
            <div id="siswa-list"><div class="loading">Memuat data siswa...</div></div>

            <!-- Modal Form Siswa -->
            <div id="modal-siswa" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title" id="modal-siswa-title">Tambah Siswa</div>

                    <div id="siswa-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" id="siswa-nama" placeholder="Nama lengkap siswa">
                    </div>
                    <div class="form-group">
                        <label>NIS</label>
                        <input type="text" id="siswa-nis" placeholder="Nomor Induk Siswa">
                    </div>
                    <div class="form-group">
                        <label>Kelas</label>
                        <select id="siswa-kelas">
                            <option value="">-- Pilih Kelas --</option>
                            <option>X IPA 1</option><option>X IPA 2</option>
                            <option>X IPS 1</option><option>X IPS 2</option>
                            <option>XI IPA 1</option><option>XI IPA 2</option>
                            <option>XI IPS 1</option><option>XI IPS 2</option>
                            <option>XII IPA 1</option><option>XII IPA 2</option>
                            <option>XII IPS 1</option><option>XII IPS 2</option>
                        </select>
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

    // Live search
    document
      .getElementById("search-siswa")
      .addEventListener("input", function () {
        filterSiswa(this.value.trim().toLowerCase());
      });
  },
});

// Simpan semua data siswa di memori untuk filtering
let _siswaCached = [];

async function loadDaftarSiswa() {
  Helpers.loading("siswa-list");
  try {
    const snap = await db.collection("siswa").orderBy("nama").get();

    if (snap.empty) {
      Helpers.emptyState(
        "siswa-list",
        "👨‍🎓",
        "Belum ada data siswa. Tap + untuk menambah.",
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
    Helpers.emptyState("siswa-list", "🔍", "Tidak ada siswa yang cocok");
    return;
  }

  container.innerHTML = list
    .map(
      (s) => `
        <div class="list-item">
            <div class="list-item-left">
                <div class="list-item-title">${s.nama}</div>
                <div class="list-item-subtitle">NIS: ${s.nis || "-"} &middot; ${s.kelas || "-"}</div>
            </div>
            <div class="list-item-right flex gap-8">
                <button class="btn btn-secondary btn-sm" onclick="editSiswa('${s.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="hapusSiswa('${s.id}', '${s.nama}')">Hapus</button>
            </div>
        </div>
    `,
    )
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
  // Reset form
  document.getElementById("siswa-nama").value = data ? data.nama : "";
  document.getElementById("siswa-nis").value = data ? data.nis || "" : "";
  document.getElementById("siswa-kelas").value = data ? data.kelas || "" : "";
  document.getElementById("siswa-jk").value = data ? data.jk || "" : "";
  document.getElementById("siswa-tahun").value = data
    ? data.tahunMasuk || ""
    : "";
  document.getElementById("siswa-edit-id").value = data ? data.id : "";
  document.getElementById("siswa-form-error").textContent = "";
  document.getElementById("modal-siswa-title").textContent = data
    ? "Edit Siswa"
    : "Tambah Siswa";
  document.getElementById("modal-siswa").classList.remove("hidden");
}

function tutupFormSiswa() {
  document.getElementById("modal-siswa").classList.add("hidden");
}

function editSiswa(id) {
  const siswa = _siswaCached.find((s) => s.id === id);
  if (siswa) showFormSiswa(siswa);
}

async function simpanSiswa() {
  const nama = document.getElementById("siswa-nama").value.trim();
  const nis = document.getElementById("siswa-nis").value.trim();
  const kelas = document.getElementById("siswa-kelas").value;
  const jk = document.getElementById("siswa-jk").value;
  const tahunMasuk = document.getElementById("siswa-tahun").value.trim();
  const editId = document.getElementById("siswa-edit-id").value;
  const errEl = document.getElementById("siswa-form-error");

  // Validasi
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

  // Cek NIS duplikat (kecuali saat edit dokumen yang sama)
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
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    if (editId) {
      // Update dokumen yang ada
      await db.collection("siswa").doc(editId).update(data);
      Router.toast("Data siswa berhasil diperbarui");
    } else {
      // Tambah dokumen baru
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("siswa").add(data);
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
    await db.collection("siswa").doc(id).delete();
    Router.toast("Siswa berhasil dihapus");
    await loadDaftarSiswa();
  } catch (err) {
    Router.toast("Gagal menghapus: " + err.message);
  }
}
