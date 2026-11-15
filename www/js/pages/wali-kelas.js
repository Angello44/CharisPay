/* ============================================================
   Halaman Wali Kelas (Admin)
   ============================================================
   Admin mengelola data wali kelas per kelas.
   Data disimpan di koleksi 'walikelas'.
   ============================================================ */

Router.register("wali-kelas", {
  title: "Wali Kelas",
  back: true,
  backTo: "dashboard-admin",
  nav: false,
  requireAuth: true,
  role: "admin",
  action: "showFormWali()",
  actionIcon: Icons.plus,

  render() {
    return `
            <div id="wali-list"><div class="loading">Memuat data wali kelas...</div></div>

            <!-- Modal Form Wali Kelas -->
            <div id="modal-wali" class="modal-overlay hidden" onclick="if(event.target===this) tutupFormWali()">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div>
                            <div class="modal-title" id="modal-wali-title">Tambah Wali Kelas</div>
                            <div class="modal-subtitle" id="modal-wali-sub">Atur guru wali untuk kelas terpilih</div>
                        </div>
                        <button type="button" class="modal-close-btn" onclick="tutupFormWali()" aria-label="Tutup">
                            ${Icons.cross}
                        </button>
                    </div>

                    <div id="wali-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="modal-body-scroll">
                        <div class="form-group">
                            <label>Kelas</label>
                            <div class="custom-select-box" id="box-wali-kelas-select" onclick="ClassPicker.open('wali-kelas-select')">
                                <span id="text-wali-kelas-select" class="placeholder">-- Pilih Kelas --</span>
                                <span class="select-chevron">${Icons.chevronDown}</span>
                            </div>
                            <input type="hidden" id="wali-kelas-select" value="">
                        </div>
                        <div class="form-group">
                            <label>Nama Wali Kelas</label>
                            <input type="text" id="wali-nama" placeholder="cth: Ibu Ani Susanti, S.Pd">
                        </div>
                        <div class="form-group">
                            <label>No. HP / WhatsApp (opsional)</label>
                            <input type="tel" id="wali-hp" placeholder="cth: 081234567890">
                        </div>
                        <input type="hidden" id="wali-edit-id">
                    </div>

                    <div class="modal-actions" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
                        <button type="button" class="btn btn-secondary" onclick="tutupFormWali()">Batal</button>
                        <button type="button" class="btn btn-primary" id="btn-simpan-wali" onclick="simpanWali()">Simpan</button>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    await loadWaliKelas();
  },
});

let _waliCached = [];

async function loadWaliKelas() {
  Helpers.loading("wali-list");
  try {
    const snap = await db.collection("walikelas").get();

    if (snap.empty) {
      Helpers.emptyState(
        "wali-list",
        Icons.teacher,
        "Belum ada data wali kelas. Klik tambah untuk menambah.",
      );
      _waliCached = [];
      return;
    }

    _waliCached = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Urutkan sesuai urutan kelas
    _waliCached.sort(
      (a, b) => URUTAN_KELAS.indexOf(a.kelas) - URUTAN_KELAS.indexOf(b.kelas),
    );

    renderWaliKelas(_waliCached);
  } catch (err) {
    Helpers.errorState("wali-list", "Gagal memuat: " + err.message);
  }
}

function renderWaliKelas(list) {
  const container = document.getElementById("wali-list");
  if (!container) return;

  // Group per jenjang
  const groups = { TK: [], SD: [], SMP: [] };
  list.forEach((w) => {
    if (["KBTK", "TKA", "TKB"].includes(w.kelas)) groups.TK.push(w);
    else if (w.kelas.startsWith("SD")) groups.SD.push(w);
    else if (w.kelas.startsWith("SMP")) groups.SMP.push(w);
  });

  let html = "";
  Object.entries(groups).forEach(([jenjang, items]) => {
    if (items.length === 0) return;

    // Urutkan items dalam jenjang sesuai urutan kelas resmi
    items.sort((a, b) => {
      const idxA = URUTAN_KELAS.indexOf(a.kelas);
      const idxB = URUTAN_KELAS.indexOf(b.kelas);
      if (idxA !== idxB) return idxA - idxB;
      // Jika kelas sama (misal 2 wali di KBTK), urutkan berdasarkan nama
      return (a.namaWali || "").localeCompare(b.namaWali || "");
    });

    const cardsHtml = items.map((w) => {
      // Cek apakah kelas ini memiliki lebih dari 1 wali kelas
      const coWali = items.filter((other) => other.kelas === w.kelas);
      let roleLabel = "";
      if (coWali.length > 1) {
        const orderIdx = coWali.findIndex((item) => item.id === w.id);
        roleLabel = `<span class="badge-soft badge-soft-primary" style="font-size:11px;margin-left:8px;font-weight:700">Wali ${orderIdx + 1}</span>`;
      }

      return `
        <div class="list-item">
          <div class="list-item-left">
            <div class="list-item-title" style="display:flex;align-items:center">
              <span>${w.kelas}</span>
              ${roleLabel}
            </div>
            <div class="list-item-subtitle">
              ${w.namaWali || "-"}
              ${w.noHp ? " &bull; " + w.noHp : ""}
            </div>
          </div>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" onclick="editWali('${w.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="hapusWali('${w.id}', '${w.kelas}')">Hapus</button>
          </div>
        </div>
      `;
    }).join("");

    html += `
      <div class="wali-jenjang-block">
        <div class="section-title">
          <span>Jenjang ${jenjang}</span>
          <span class="badge-wali-count">${items.length} Guru</span>
        </div>
        <div class="wali-group-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML =
    html ||
    '<div class="empty-state"><div class="empty-state-text">Belum ada data wali kelas</div></div>';
}

function showFormWali(data = null) {
  // Isi dropdown kelas
  ClassPicker.setValue("wali-kelas-select", data ? data.kelas : "");
  document.getElementById("wali-nama").value = data ? data.namaWali || "" : "";
  document.getElementById("wali-hp").value = data ? data.noHp || "" : "";
  document.getElementById("wali-edit-id").value = data ? data.id : "";
  document.getElementById("wali-form-error").textContent = "";
  document.getElementById("modal-wali-title").textContent = data
    ? "Edit Wali Kelas"
    : "Tambah Wali Kelas";
  const subEl = document.getElementById("modal-wali-sub");
  if (subEl) {
    subEl.textContent = data
      ? "Perbarui guru wali untuk kelas terpilih"
      : "Atur guru wali untuk kelas terpilih (maksimal 2 guru per kelas)";
  }
  document.getElementById("modal-wali").classList.remove("hidden");
}

function tutupFormWali() {
  document.getElementById("modal-wali").classList.add("hidden");
}

function editWali(id) {
  const wali = _waliCached.find((w) => w.id === id);
  if (wali) showFormWali(wali);
}

async function simpanWali() {
  const kelas = document.getElementById("wali-kelas-select").value;
  const namaWali = document.getElementById("wali-nama").value.trim();
  const noHp = document.getElementById("wali-hp").value.trim();
  const editId = document.getElementById("wali-edit-id").value;
  const errEl = document.getElementById("wali-form-error");

  if (!kelas) {
    errEl.textContent = "Kelas wajib dipilih";
    return;
  }
  if (!namaWali) {
    errEl.textContent = "Nama wali kelas wajib diisi";
    return;
  }

  // Cek jumlah wali kelas untuk kelas ini (diizinkan hingga 2 wali kelas per kelas)
  const existingWali = _waliCached.filter((w) => w.kelas === kelas && w.id !== editId);
  if (existingWali.length >= 2) {
    errEl.textContent = `Kelas ${kelas} sudah memiliki 2 wali kelas (maksimal 2 guru).`;
    return;
  }

  Helpers.btnLoading("btn-simpan-wali", "Menyimpan...");
  try {
    const data = {
      kelas,
      namaWali,
      noHp,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (editId) {
      await db.collection("walikelas").doc(editId).update(data);
      Router.toast("Wali kelas berhasil diperbarui");
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("walikelas").add(data);
      Router.toast("Wali kelas berhasil ditambahkan");
    }
    tutupFormWali();
    await loadWaliKelas();
  } catch (err) {
    errEl.textContent = "Gagal: " + err.message;
  } finally {
    Helpers.btnReset("btn-simpan-wali");
  }
}

async function hapusWali(id, kelas) {
  const ok = await Helpers.confirm(`Hapus wali kelas "${kelas}"?`);
  if (!ok) return;
  try {
    await db.collection("walikelas").doc(id).delete();
    Router.toast("Wali kelas berhasil dihapus");
    await loadWaliKelas();
  } catch (err) {
    Router.toast("Gagal: " + err.message);
  }
}

/** Ambil seluruh wali kelas untuk suatu kelas (array hingga 2 guru) */
async function getSemuaWaliByKelas(kelas) {
  if (!kelas) return [];
  // Cek cache dulu
  const cached = _waliCached.filter((w) => w.kelas === kelas);
  if (cached.length > 0) return cached;

  // Query Firestore
  try {
    const snap = await db
      .collection("walikelas")
      .where("kelas", "==", kelas)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

/** Ambil data wali kelas utama berdasarkan nama kelas — backward compat */
async function getWaliByKelas(kelas) {
  if (!kelas) return null;
  const list = await getSemuaWaliByKelas(kelas);
  return list.length > 0 ? list[0] : null;
}
