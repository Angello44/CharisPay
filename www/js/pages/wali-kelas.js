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
    actionIcon: "+",

    render() {
        return `
            <div id="wali-list"><div class="loading">Memuat data wali kelas...</div></div>

            <!-- Modal Form Wali Kelas -->
            <div id="modal-wali" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title" id="modal-wali-title">Tambah Wali Kelas</div>
                    <div id="wali-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="form-group">
                        <label>Kelas</label>
                        <select id="wali-kelas-select"></select>
                    </div>
                    <div class="form-group">
                        <label>Nama Wali Kelas</label>
                        <input type="text" id="wali-nama" placeholder="cth: Bu Ani Susanti">
                    </div>
                    <div class="form-group">
                        <label>No. HP (opsional)</label>
                        <input type="tel" id="wali-hp" placeholder="cth: 081234567890">
                    </div>

                    <input type="hidden" id="wali-edit-id">

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupFormWali()">Batal</button>
                        <button class="btn btn-primary" id="btn-simpan-wali" onclick="simpanWali()">Simpan</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await loadWaliKelas();
    }
});

let _waliCached = [];

async function loadWaliKelas() {
    Helpers.loading("wali-list");
    try {
        const snap = await db.collection("walikelas").get();

        if (snap.empty) {
            Helpers.emptyState("wali-list", "👩‍🏫", "Belum ada data wali kelas. Tap + untuk menambah.");
            _waliCached = [];
            return;
        }

        _waliCached = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Urutkan sesuai urutan kelas
        _waliCached.sort((a, b) =>
            URUTAN_KELAS.indexOf(a.kelas) - URUTAN_KELAS.indexOf(b.kelas)
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
    list.forEach(w => {
        if (["KBTK","TKA","TKB"].includes(w.kelas)) groups.TK.push(w);
        else if (w.kelas.startsWith("SD"))  groups.SD.push(w);
        else if (w.kelas.startsWith("SMP")) groups.SMP.push(w);
    });

    let html = "";
    Object.entries(groups).forEach(([jenjang, items]) => {
        if (items.length === 0) return;
        html += `<div class="section-title">${jenjang}</div>`;
        items.forEach(w => {
            html += `
                <div class="list-item">
                    <div class="list-item-left">
                        <div class="list-item-title">${w.kelas}</div>
                        <div class="list-item-subtitle">
                            👩‍🏫 ${w.namaWali || "-"}
                            ${w.noHp ? " &middot; 📞 " + w.noHp : ""}
                        </div>
                    </div>
                    <div class="flex gap-8">
                        <button class="btn btn-secondary btn-sm" onclick="editWali('${w.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="hapusWali('${w.id}', '${w.kelas}')">Hapus</button>
                    </div>
                </div>
            `;
        });
    });

    container.innerHTML = html || '<div class="empty-state"><div class="empty-state-text">Belum ada data</div></div>';
}

function showFormWali(data = null) {
    // Isi dropdown kelas
    document.getElementById("wali-kelas-select").innerHTML = getKelasOptions(data ? data.kelas : "");
    document.getElementById("wali-nama").value     = data ? data.namaWali || "" : "";
    document.getElementById("wali-hp").value       = data ? data.noHp || "" : "";
    document.getElementById("wali-edit-id").value  = data ? data.id : "";
    document.getElementById("wali-form-error").textContent = "";
    document.getElementById("modal-wali-title").textContent = data ? "Edit Wali Kelas" : "Tambah Wali Kelas";
    document.getElementById("modal-wali").classList.remove("hidden");
}

function tutupFormWali() {
    document.getElementById("modal-wali").classList.add("hidden");
}

function editWali(id) {
    const wali = _waliCached.find(w => w.id === id);
    if (wali) showFormWali(wali);
}

async function simpanWali() {
    const kelas    = document.getElementById("wali-kelas-select").value;
    const namaWali = document.getElementById("wali-nama").value.trim();
    const noHp     = document.getElementById("wali-hp").value.trim();
    const editId   = document.getElementById("wali-edit-id").value;
    const errEl    = document.getElementById("wali-form-error");

    if (!kelas)    { errEl.textContent = "Kelas wajib dipilih"; return; }
    if (!namaWali) { errEl.textContent = "Nama wali kelas wajib diisi"; return; }

    // Cek duplikat kelas (kecuali saat edit)
    const dup = _waliCached.find(w => w.kelas === kelas && w.id !== editId);
    if (dup) { errEl.textContent = "Kelas ini sudah punya wali kelas"; return; }

    Helpers.btnLoading("btn-simpan-wali", "Menyimpan...");
    try {
        const data = { kelas, namaWali, noHp, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
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

/** Ambil nama wali kelas berdasarkan nama kelas — dipakai di halaman lain */
async function getWaliByKelas(kelas) {
    if (!kelas) return null;
    // Cek cache dulu
    const cached = _waliCached.find(w => w.kelas === kelas);
    if (cached) return cached;

    // Query Firestore
    const snap = await db.collection("walikelas").where("kelas", "==", kelas).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}
