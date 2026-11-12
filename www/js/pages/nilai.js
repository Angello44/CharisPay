/* ============================================================
   Halaman Nilai Rata-rata
   ============================================================
   Admin: input nilai rata-rata akhir per siswa per kelas.
   Ortu: lihat nilai kelas sebelumnya dari anak mereka.
   ============================================================ */

// ---- Halaman Admin: Input Nilai ----
Router.register("nilai-admin", {
    title: "Input Nilai",
    back: true,
    backTo: "dashboard-admin",
    nav: false,
    requireAuth: true,
    role: "admin",

    render() {
        return `
            <div class="form-group flex gap-8">
                <select id="filter-kelas-nilai" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                    <option value="">Semua Kelas</option>
                </select>
            </div>
            <div id="nilai-admin-list"><div class="loading">Memuat data...</div></div>

            <!-- Modal Input Nilai -->
            <div id="modal-nilai" class="modal-overlay hidden">
                <div class="modal">
                    <div class="modal-title" id="modal-nilai-title">Input Nilai</div>
                    <div id="nilai-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="card" style="background:var(--primary-light);margin-bottom:12px">
                        <div class="text-sm font-semibold" id="nilai-siswa-info"></div>
                    </div>

                    <div class="form-group">
                        <label>Kelas yang Dinilai</label>
                        <input type="text" id="nilai-kelas" readonly
                               style="background:#f9fafb;color:var(--text-secondary)">
                    </div>
                    <div class="form-group">
                        <label>Tahun Ajaran</label>
                        <input type="text" id="nilai-tahun" placeholder="cth: 2025/2026">
                    </div>
                    <div class="form-group">
                        <label>Nilai Rata-rata Akhir</label>
                        <input type="number" id="nilai-angka" placeholder="cth: 85.5" min="0" max="100" step="0.1">
                        <div class="form-hint">Skala 0–100</div>
                    </div>
                    <div class="form-group">
                        <label>Keterangan (opsional)</label>
                        <input type="text" id="nilai-ket" placeholder="cth: Sangat Memuaskan">
                    </div>

                    <input type="hidden" id="nilai-siswa-id">
                    <input type="hidden" id="nilai-edit-id">

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupFormNilai()">Batal</button>
                        <button class="btn btn-primary" id="btn-simpan-nilai" onclick="simpanNilai()">Simpan</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        // Isi dropdown filter kelas
        const select = document.getElementById("filter-kelas-nilai");
        select.innerHTML += DAFTAR_KELAS.map(k => `<option value="${k}">${k}</option>`).join("");
        select.addEventListener("change", () => loadNilaiAdmin(select.value));
        await loadNilaiAdmin();
    }
});

let _nilaiAdminSiswaCached = [];

async function loadNilaiAdmin(filterKelas = "") {
    Helpers.loading("nilai-admin-list");
    try {
        // Ambil semua siswa (filter kelas kalau ada)
        let query = db.collection("siswa");
        if (filterKelas) query = query.where("kelas", "==", filterKelas);
        const siswaSnap = await query.get();

        if (siswaSnap.empty) {
            Helpers.emptyState("nilai-admin-list", "👨‍🎓", "Tidak ada siswa" + (filterKelas ? " di kelas " + filterKelas : ""));
            return;
        }

        _nilaiAdminSiswaCached = siswaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        _nilaiAdminSiswaCached.sort((a, b) => a.nama.localeCompare(b.nama));

        // Ambil semua nilai yang sudah ada
        const nilaiSnap = await db.collection("nilai").get();
        const nilaiMap = {};
        nilaiSnap.docs.forEach(d => {
            const n = d.data();
            nilaiMap[n.siswaId + "_" + n.kelas] = { id: d.id, ...n };
        });

        const container = document.getElementById("nilai-admin-list");
        container.innerHTML = _nilaiAdminSiswaCached.map(s => {
            // Cari nilai kelas saat ini (kelas terakhir sebelum naik)
            const kelasLama = getKelasSebelmunya(s.kelas);
            const nilaiAda  = kelasLama ? nilaiMap[s.id + "_" + kelasLama] : null;

            return `
                <div class="list-item">
                    <div class="list-item-left">
                        <div class="list-item-title">${s.nama}</div>
                        <div class="list-item-subtitle">${s.kelas} &middot; NIS: ${s.nis || "-"}</div>
                        ${nilaiAda
                            ? `<div class="text-sm" style="color:var(--success)">✓ Nilai ${kelasLama}: <strong>${nilaiAda.nilaiRataRata}</strong></div>`
                            : (kelasLama
                                ? `<div class="text-sm text-secondary">Belum ada nilai untuk kelas ${kelasLama}</div>`
                                : `<div class="text-sm text-secondary">Kelas pertama — belum ada nilai sebelumnya</div>`)
                        }
                    </div>
                    ${kelasLama ? `
                    <button class="btn btn-${nilaiAda ? 'secondary' : 'primary'} btn-sm"
                            onclick="showFormNilai('${s.id}', '${s.nama}', '${kelasLama}', '${nilaiAda ? nilaiAda.id : ''}', '${nilaiAda ? nilaiAda.nilaiRataRata : ''}', '${nilaiAda ? nilaiAda.tahunAjaran || '' : ''}', '${nilaiAda ? nilaiAda.keterangan || '' : ''}')">
                        ${nilaiAda ? "Edit" : "Input"}
                    </button>` : ""}
                </div>
            `;
        }).join("");

    } catch (err) {
        Helpers.errorState("nilai-admin-list", "Gagal memuat: " + err.message);
    }
}

function showFormNilai(siswaId, namaSiswa, kelas, editId = "", nilaiAda = "", tahun = "", ket = "") {
    document.getElementById("nilai-siswa-info").textContent = namaSiswa + " — Kelas " + kelas;
    document.getElementById("nilai-kelas").value   = kelas;
    document.getElementById("nilai-tahun").value   = tahun;
    document.getElementById("nilai-angka").value   = nilaiAda;
    document.getElementById("nilai-ket").value     = ket;
    document.getElementById("nilai-siswa-id").value = siswaId;
    document.getElementById("nilai-edit-id").value  = editId;
    document.getElementById("nilai-form-error").textContent = "";
    document.getElementById("modal-nilai-title").textContent = editId ? "Edit Nilai" : "Input Nilai";
    document.getElementById("modal-nilai").classList.remove("hidden");
}

function tutupFormNilai() {
    document.getElementById("modal-nilai").classList.add("hidden");
}

async function simpanNilai() {
    const siswaId   = document.getElementById("nilai-siswa-id").value;
    const kelas     = document.getElementById("nilai-kelas").value;
    const tahun     = document.getElementById("nilai-tahun").value.trim();
    const angka     = document.getElementById("nilai-angka").value;
    const ket       = document.getElementById("nilai-ket").value.trim();
    const editId    = document.getElementById("nilai-edit-id").value;
    const errEl     = document.getElementById("nilai-form-error");

    if (!tahun)  { errEl.textContent = "Tahun ajaran wajib diisi"; return; }
    if (angka === "" || isNaN(angka)) { errEl.textContent = "Nilai wajib diisi"; return; }
    if (parseFloat(angka) < 0 || parseFloat(angka) > 100) {
        errEl.textContent = "Nilai harus antara 0–100"; return;
    }

    Helpers.btnLoading("btn-simpan-nilai", "Menyimpan...");
    try {
        const data = {
            siswaId, kelas,
            nilaiRataRata: parseFloat(angka),
            tahunAjaran:   tahun,
            keterangan:    ket,
            updatedAt:     firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editId) {
            await db.collection("nilai").doc(editId).update(data);
            Router.toast("Nilai berhasil diperbarui");
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("nilai").add(data);
            Router.toast("Nilai berhasil disimpan");
        }

        tutupFormNilai();
        const filter = document.getElementById("filter-kelas-nilai").value;
        await loadNilaiAdmin(filter);
    } catch (err) {
        errEl.textContent = "Gagal: " + err.message;
    } finally {
        Helpers.btnReset("btn-simpan-nilai");
    }
}

// ---- Halaman Ortu: Lihat Nilai ----
Router.register("nilai-ortu", {
    title: "Nilai Anak",
    back: true,
    backTo: "dashboard-ortu",
    nav: false,
    requireAuth: true,
    role: "ortu",

    render() {
        return `<div id="nilai-ortu-content"><div class="loading">Memuat nilai...</div></div>`;
    },

    async init() {
        await loadNilaiOrtu();
    }
});

async function loadNilaiOrtu() {
    const container = document.getElementById("nilai-ortu-content");
    try {
        const siswaList = await getSiswaOrtu();

        if (siswaList.length === 0) {
            Helpers.emptyState("nilai-ortu-content", "📊", "Data siswa belum terhubung. Hubungi admin sekolah.");
            return;
        }

        let html = "";

        for (const siswa of siswaList) {
            const kelasLama = getKelasSebelmunya(siswa.kelas);

            // Ambil wali kelas saat ini
            const wali = await getWaliByKelas(siswa.kelas);

            html += `
                <div class="card">
                    <div class="card-title">📚 ${siswa.nama}</div>
                    <div class="card-row">
                        <span class="card-label">Kelas Sekarang</span>
                        <span class="card-value">${siswa.kelas}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Wali Kelas</span>
                        <span class="card-value">${wali ? wali.namaWali : "-"}</span>
                    </div>
                    ${wali && wali.noHp ? `
                    <div class="card-row">
                        <span class="card-label">No. HP Wali</span>
                        <span class="card-value">${wali.noHp}</span>
                    </div>` : ""}
                </div>
            `;

            if (!kelasLama) {
                html += `
                    <div class="card" style="background:var(--warning-light)">
                        <p class="text-sm" style="color:var(--warning)">
                            ${siswa.nama} masih di kelas pertama (${siswa.kelas}). Nilai akan muncul setelah naik kelas.
                        </p>
                    </div>
                `;
                continue;
            }

            // Ambil nilai kelas sebelumnya
            const nilaiSnap = await db.collection("nilai")
                .where("siswaId", "==", siswa.id)
                .where("kelas", "==", kelasLama)
                .get();

            if (nilaiSnap.empty) {
                html += `
                    <div class="card">
                        <div class="card-title">📊 Nilai Kelas ${kelasLama}</div>
                        <p class="text-sm text-secondary">Nilai belum diinput oleh admin.</p>
                    </div>
                `;
            } else {
                const n = nilaiSnap.docs[0].data();
                const predikat = nilaiToPredikat(n.nilaiRataRata);

                html += `
                    <div class="card">
                        <div class="card-title">📊 Nilai Kelas ${kelasLama}</div>
                        <div class="card-row">
                            <span class="card-label">Tahun Ajaran</span>
                            <span class="card-value">${n.tahunAjaran || "-"}</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Nilai Rata-rata</span>
                            <span class="card-value font-semibold" style="font-size:24px;color:${predikat.warna}">
                                ${n.nilaiRataRata}
                            </span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Predikat</span>
                            <span class="badge" style="background:${predikat.warna}20;color:${predikat.warna}">
                                ${predikat.label}
                            </span>
                        </div>
                        ${n.keterangan ? `
                        <div class="card-row">
                            <span class="card-label">Keterangan</span>
                            <span class="card-value">${n.keterangan}</span>
                        </div>` : ""}
                    </div>
                `;
            }
        }

        container.innerHTML = html;

    } catch (err) {
        Helpers.errorState("nilai-ortu-content", "Gagal memuat: " + err.message);
    }
}

function nilaiToPredikat(nilai) {
    if (nilai >= 90) return { label: "A — Sangat Baik",   warna: "#16a34a" };
    if (nilai >= 80) return { label: "B — Baik",          warna: "#2563eb" };
    if (nilai >= 70) return { label: "C — Cukup",         warna: "#d97706" };
    if (nilai >= 60) return { label: "D — Perlu Bimbingan", warna: "#dc2626" };
    return { label: "E — Kurang",  warna: "#7f1d1d" };
}
