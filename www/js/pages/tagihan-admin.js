/* ============================================================
   Halaman Tagihan SPP (Admin)
   ============================================================ */

Router.register("tagihan-admin", {
  title: "Kelola Tagihan",
  back: true,
  backTo: "dashboard-admin",
  nav: false,
  requireAuth: true,
  role: "admin",
  action: "showPilihJenisTagihan()",
  actionIcon: "+",

  render() {
    return `
            <div class="form-group flex gap-8" style="margin-bottom:0">
                <select id="filter-status-tagihan"
                        style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                    <option value="">Semua Status</option>
                    <option value="belum">Belum Dibayar</option>
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="lunas">Lunas</option>
                    <option value="revisi">Perlu Revisi</option>
                    <option value="ditolak">Ditolak</option>
                </select>
                <select id="filter-kelas-tagihan"
                        style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                    <option value="">Semua Jenjang/Kelas</option>
                </select>
            </div>

            <div id="summary-tagihan" class="summary-grid" style="margin-top:12px"></div>
            <div id="tagihan-admin-list"><div class="loading">Memuat tagihan...</div></div>

            <!-- =====================================================
                 Modal Pilih Jenis Buat Tagihan
                 ===================================================== -->
            <div id="modal-pilih-jenis" class="modal-overlay hidden">
                <div class="modal">
                    <div class="modal-title">Buat Tagihan SPP</div>
                    <p class="text-sm text-secondary mb-16">Pilih cara membuat tagihan:</p>

                    <button class="btn btn-primary mb-8"
                            onclick="tutupModalPilihJenis(); showFormBulkTagihan()">
                        ${Icons.students} Semua Siswa (Massal)
                        <span style="display:block;font-size:12px;font-weight:400;opacity:0.85">
                            Buat tagihan satu periode untuk semua siswa / per jenjang
                        </span>
                    </button>

                    <button class="btn btn-secondary mb-8"
                            onclick="tutupModalPilihJenis(); showFormTagihan()">
                        ${Icons.student} Satu Siswa
                        <span style="display:block;font-size:12px;font-weight:400;opacity:0.75">
                            Buat tagihan untuk siswa tertentu saja
                        </span>
                    </button>

                    <button class="btn btn-outline" onclick="tutupModalPilihJenis()">Batal</button>
                </div>
            </div>

            <!-- =====================================================
                 Modal Bulk Tagihan (semua siswa / per jenjang / kelas)
                 ===================================================== -->
            <div id="modal-bulk-tagihan" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title">Buat Tagihan Siswa (Massal)</div>
                    <div id="bulk-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="form-group">
                        <label>Target Jenjang / Kelas</label>
                        <select id="bulk-kelas"></select>
                        <div class="form-hint">Pilih seluruh jenjang (TK / SD / SMP) atau kelas spesifik</div>
                    </div>

                    <div class="form-group">
                        <label>Periode (Bulan/Tahun)</label>
                        <input type="month" id="bulk-periode">
                    </div>
                    <div class="form-group">
                        <label>Nominal SPP (Rp)</label>
                        <input type="number" id="bulk-nominal" placeholder="cth: 350000" min="1">
                    </div>
                    <div class="form-group">
                        <label>Jatuh Tempo</label>
                        <input type="date" id="bulk-jatuh-tempo">
                    </div>
                    <div class="form-group">
                        <label>Keterangan (opsional)</label>
                        <input type="text" id="bulk-keterangan" placeholder="cth: SPP Desember 2026">
                    </div>

                    <!-- Preview jumlah siswa -->
                    <div id="bulk-preview" style="display:none;margin-bottom:12px">
                        <div class="card" style="background:var(--primary-light);padding:12px">
                            <div class="text-sm font-semibold" id="bulk-preview-text"></div>
                        </div>
                    </div>

                    <!-- Progress bar saat proses -->
                    <div id="bulk-progress" style="display:none;margin-bottom:12px">
                        <div class="text-sm text-secondary mb-8" id="bulk-progress-text">Membuat tagihan...</div>
                        <div style="background:var(--border);border-radius:4px;height:8px">
                            <div id="bulk-progress-bar"
                                 style="background:var(--primary);height:8px;border-radius:4px;width:0%;transition:width 0.3s"></div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupFormBulkTagihan()">Batal</button>
                        <button class="btn btn-primary" id="btn-buat-bulk" onclick="buatTagihanBulk()">
                            Buat Tagihan
                        </button>
                    </div>
                </div>
            </div>

            <!-- =====================================================
                 Modal Form Tagihan (satu siswa)
                 ===================================================== -->
            <div id="modal-tagihan" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title">Buat Tagihan SPP</div>
                    <div id="tagihan-form-error" class="form-error" style="margin-bottom:10px"></div>

                    <div class="form-group">
                        <label>Siswa</label>
                        <select id="tagihan-siswa-id">
                            <option value="">-- Pilih Siswa --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Periode (Bulan/Tahun)</label>
                        <input type="month" id="tagihan-periode">
                    </div>
                    <div class="form-group">
                        <label>Nominal (Rp)</label>
                        <input type="number" id="tagihan-nominal" placeholder="cth: 350000" min="1">
                    </div>
                    <div class="form-group">
                        <label>Jatuh Tempo</label>
                        <input type="date" id="tagihan-jatuh-tempo">
                    </div>
                    <div class="form-group">
                        <label>Keterangan (opsional)</label>
                        <textarea id="tagihan-keterangan"
                                  placeholder="cth: SPP bulan November 2026"></textarea>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupFormTagihan()">Batal</button>
                        <button class="btn btn-primary" id="btn-simpan-tagihan"
                                onclick="simpanTagihan()">Buat Tagihan</button>
                    </div>
                </div>
            </div>

            <!-- =====================================================
                 Modal Catat Pembayaran Tunai
                 ===================================================== -->
            <div id="modal-tunai" class="modal-overlay hidden">
                <div class="modal">
                    <div class="modal-title">Catat Pembayaran Tunai</div>
                    <div id="tunai-form-error" class="form-error" style="margin-bottom:10px"></div>
                    <p class="text-sm text-secondary mb-16" id="tunai-info-text"></p>
                    <div class="form-group">
                        <label>Tanggal Pembayaran</label>
                        <input type="date" id="tunai-tanggal">
                    </div>
                    <div class="form-group">
                        <label>Keterangan (opsional)</label>
                        <input type="text" id="tunai-ket" placeholder="cth: Diterima oleh Bu Ani">
                    </div>
                    <input type="hidden" id="tunai-tagihan-id">
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupModalTunai()">Batal</button>
                        <button class="btn btn-success" id="btn-konfirmasi-tunai"
                                onclick="konfirmasiTunai()">Konfirmasi Lunas</button>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    const filterKelasEl = document.getElementById("filter-kelas-tagihan");
    if (filterKelasEl) {
      filterKelasEl.innerHTML = getBulkKelasOptions("Semua Jenjang/Kelas");
      filterKelasEl.addEventListener("change", () => loadTagihanAdmin());
    }

    const filterStatusEl = document.getElementById("filter-status-tagihan");
    if (filterStatusEl) {
      filterStatusEl.addEventListener("change", () => loadTagihanAdmin());
    }

    await loadTagihanAdmin();
  },
});

/* ============================================================
   Helper Pilihan Jenjang & Kelas (Charis Institute: TK, SD, SMP)
   ============================================================ */

function getBulkKelasOptions(labelSemua = "Semua Siswa (Semua Jenjang)") {
  const groups = [
    {
      label: "Berdasarkan Jenjang / Tingkat",
      items: [
        { val: "TINGKAT:TK", label: "Seluruh Jenjang TK (KBTK, TKA, TKB)" },
        { val: "TINGKAT:SD", label: "Seluruh Jenjang SD (SD 1A - SD 6C)" },
        { val: "TINGKAT:SMP", label: "Seluruh Jenjang SMP (SMP 1A - SMP 3C)" },
      ],
    },
    {
      label: "Kelas TK",
      items: ["KBTK", "TKA", "TKB"].map((k) => ({ val: k, label: k })),
    },
    {
      label: "Kelas SD",
      items: DAFTAR_KELAS.filter((k) => k.startsWith("SD")).map((k) => ({
        val: k,
        label: k,
      })),
    },
    {
      label: "Kelas SMP",
      items: DAFTAR_KELAS.filter((k) => k.startsWith("SMP")).map((k) => ({
        val: k,
        label: k,
      })),
    },
  ];

  let html = `<option value="">${labelSemua}</option>`;
  groups.forEach((g) => {
    html += `<optgroup label="${g.label}">`;
    g.items.forEach((item) => {
      html += `<option value="${item.val}">${item.label}</option>`;
    });
    html += "</optgroup>";
  });
  return html;
}

async function getSiswaByKelasFilter(filterVal) {
  const snap = await db.collection("siswa").get();
  if (snap.empty) return [];

  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (!filterVal) {
    return all;
  }
  if (filterVal === "TINGKAT:TK") {
    return all.filter(
      (s) =>
        ["KBTK", "TKA", "TKB"].includes(s.kelas) ||
        (s.kelas && s.kelas.startsWith("TK")),
    );
  }
  if (filterVal === "TINGKAT:SD") {
    return all.filter((s) => s.kelas && s.kelas.startsWith("SD"));
  }
  if (filterVal === "TINGKAT:SMP") {
    return all.filter((s) => s.kelas && s.kelas.startsWith("SMP"));
  }
  return all.filter((s) => s.kelas === filterVal);
}

/* ============================================================
   Load & Render Tagihan
   ============================================================ */

let _tagihanAdminCached = [];

async function loadTagihanAdmin() {
  Helpers.loading("tagihan-admin-list");
  try {
    const filterStatusEl = document.getElementById("filter-status-tagihan");
    const filterKelasEl = document.getElementById("filter-kelas-tagihan");
    const filterStatus = filterStatusEl ? filterStatusEl.value : "";
    const filterKelas = filterKelasEl ? filterKelasEl.value : "";

    let query = db.collection("tagihan");
    if (filterStatus) query = query.where("status", "==", filterStatus);
    const snap = await query.get();

    // Summary dari semua tagihan
    const all = await db.collection("tagihan").get();
    const counts = { belum: 0, menunggu: 0, lunas: 0, revisi: 0, ditolak: 0 };
    all.docs.forEach((d) => {
      const s = d.data().status;
      if (counts[s] !== undefined) counts[s]++;
    });

    const summaryEl = document.getElementById("summary-tagihan");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card warning"><div class="summary-number">${counts.belum}</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">${counts.menunggu}</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">${counts.lunas}</div><div class="summary-label">Lunas</div></div>
                <div class="summary-card danger"><div class="summary-number">${counts.revisi + counts.ditolak}</div><div class="summary-label">Revisi/Tolak</div></div>
            `;
    }

    if (snap.empty) {
      Helpers.emptyState(
        "tagihan-admin-list",
        Icons.receipt,
        "Belum ada data tagihan. Klik tambah untuk membuat.",
      );
      return;
    }

    let list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter jenjang / kelas di client
    if (filterKelas) {
      if (filterKelas === "TINGKAT:TK") {
        list = list.filter(
          (t) =>
            ["KBTK", "TKA", "TKB"].includes(t.kelas) ||
            (t.kelas && t.kelas.startsWith("TK")),
        );
      } else if (filterKelas === "TINGKAT:SD") {
        list = list.filter((t) => t.kelas && t.kelas.startsWith("SD"));
      } else if (filterKelas === "TINGKAT:SMP") {
        list = list.filter((t) => t.kelas && t.kelas.startsWith("SMP"));
      } else {
        list = list.filter((t) => t.kelas === filterKelas);
      }
    }

    list.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    _tagihanAdminCached = list;

    if (list.length === 0) {
      Helpers.emptyState(
        "tagihan-admin-list",
        Icons.search,
        "Tidak ada tagihan yang sesuai dengan filter",
      );
      return;
    }

    renderTagihanAdmin(list);
  } catch (err) {
    console.error(err);
    Helpers.errorState("tagihan-admin-list", "Gagal memuat: " + err.message);
  }
}

function renderTagihanAdmin(list) {
  const container = document.getElementById("tagihan-admin-list");
  if (!container) return;

  container.innerHTML = list
    .map((t) => {
      let actionBtn = "";
      if (t.status === "belum") {
        actionBtn = `<button class="btn btn-success btn-sm" onclick="showModalTunai('${t.id}')">Catat Tunai</button>`;
      } else if (t.status === "menunggu") {
        actionBtn = `<button class="btn btn-primary btn-sm" onclick="Router.go('verifikasi')">Verifikasi</button>`;
      }

      return `
            <div class="card" style="margin-bottom:10px">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <div class="font-semibold">${t.namaSiswa || "Siswa"}</div>
                        <div class="text-sm text-secondary">${t.kelas || ""} &middot; SPP ${Helpers.periodeLabel(t.periode)}</div>
                    </div>
                    ${Helpers.badge(t.status)}
                </div>
                <div class="card-row">
                    <span class="card-label">Nominal</span>
                    <span class="card-value font-semibold">${Helpers.rupiah(t.nominal)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Jatuh Tempo</span>
                    <span class="card-value">${t.jatuhTempo || "-"}</span>
                </div>
                ${actionBtn ? `<div class="mt-8">${actionBtn}</div>` : ""}
            </div>
        `;
    })
    .join("");
}

/* ============================================================
   Modal Pilih Jenis Tagihan
   ============================================================ */

function showPilihJenisTagihan() {
  document.getElementById("modal-pilih-jenis").classList.remove("hidden");
}

function tutupModalPilihJenis() {
  document.getElementById("modal-pilih-jenis").classList.add("hidden");
}

/* ============================================================
   Bulk Tagihan — Semua Siswa Sekaligus
   ============================================================ */

function showFormBulkTagihan() {
  // Isi dropdown target kelas / jenjang
  document.getElementById("bulk-kelas").innerHTML = getBulkKelasOptions(
    "Semua Siswa (Semua Jenjang)",
  );

  // Default nilai
  const now = new Date();
  const bulanDepan = new Date(now.getFullYear(), now.getMonth() + 1, 20);
  document.getElementById("bulk-periode").value =
    now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  document.getElementById("bulk-jatuh-tempo").value = bulanDepan
    .toISOString()
    .split("T")[0];
  document.getElementById("bulk-nominal").value = "";
  document.getElementById("bulk-keterangan").value = "";
  document.getElementById("bulk-kelas").value = "";
  document.getElementById("bulk-form-error").textContent = "";
  document.getElementById("bulk-preview").style.display = "none";
  document.getElementById("bulk-progress").style.display = "none";
  document.getElementById("modal-bulk-tagihan").classList.remove("hidden");

  // Auto preview saat jenjang/kelas atau periode dipilih
  document.getElementById("bulk-kelas").onchange = previewBulk;
  document.getElementById("bulk-periode").onchange = previewBulk;
  previewBulk();
}

function tutupFormBulkTagihan() {
  document.getElementById("modal-bulk-tagihan").classList.add("hidden");
}

async function previewBulk() {
  const filterVal = document.getElementById("bulk-kelas").value;
  const periode = document.getElementById("bulk-periode").value;
  const previewEl = document.getElementById("bulk-preview");
  const previewText = document.getElementById("bulk-preview-text");

  if (!periode) {
    previewEl.style.display = "none";
    return;
  }

  try {
    const siswaList = await getSiswaByKelasFilter(filterVal);
    const totalSiswa = siswaList.length;

    let sudahAda = 0;
    if (totalSiswa > 0) {
      const tagihanSnap = await db
        .collection("tagihan")
        .where("periode", "==", periode)
        .get();
      const siswaIdDenganTagihan = new Set(
        tagihanSnap.docs.map((d) => d.data().siswaId),
      );
      sudahAda = siswaList.filter((s) =>
        siswaIdDenganTagihan.has(s.id),
      ).length;
    }

    const akanDibuat = totalSiswa - sudahAda;
    previewEl.style.display = "block";

    const kelasOpt = document.querySelector(
      `#bulk-kelas option[value="${filterVal}"]`,
    );
    const labelKelas = kelasOpt ? kelasOpt.textContent : "Semua Siswa";

    if (totalSiswa === 0) {
      previewText.innerHTML = `<span style="color:var(--danger)">Tidak ada siswa terdaftar pada target: <strong>${labelKelas}</strong></span>`;
    } else {
      previewText.innerHTML = `
        Target: <strong>${labelKelas}</strong><br>
        Total siswa: <strong>${totalSiswa}</strong><br>
        Sudah ada tagihan periode ini: <strong>${sudahAda}</strong><br>
        Akan dibuat: <strong style="color:var(--primary)">${akanDibuat} tagihan baru</strong>
        ${sudahAda > 0 ? "<br><span style='color:var(--warning);font-size:12px'>Siswa yang sudah memiliki tagihan di periode ini dilewati otomatis</span>" : ""}
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

async function buatTagihanBulk() {
  const periode = document.getElementById("bulk-periode").value;
  const nominal = document.getElementById("bulk-nominal").value;
  const jatuhTempo = document.getElementById("bulk-jatuh-tempo").value;
  const keterangan = document.getElementById("bulk-keterangan").value.trim();
  const filterVal = document.getElementById("bulk-kelas").value;
  const errEl = document.getElementById("bulk-form-error");

  // Validasi
  if (!periode) {
    errEl.textContent = "Periode wajib diisi";
    return;
  }
  if (!nominal || parseInt(nominal) < 1) {
    errEl.textContent = "Nominal harus lebih dari 0";
    return;
  }
  if (!jatuhTempo) {
    errEl.textContent = "Jatuh tempo wajib diisi";
    return;
  }

  const kelasOpt = document.querySelector(
    `#bulk-kelas option[value="${filterVal}"]`,
  );
  const labelKelas = kelasOpt ? kelasOpt.textContent : "semua siswa";

  const ok = await Helpers.confirm(
    `Buat tagihan SPP ${Helpers.periodeLabel(periode)} senilai ${Helpers.rupiah(parseInt(nominal))} ` +
      `untuk ${labelKelas}?`,
  );
  if (!ok) return;

  // Ambil data siswa sesuai filter kelas/jenjang
  const siswaSnapList = await getSiswaByKelasFilter(filterVal);

  if (siswaSnapList.length === 0) {
    errEl.textContent = "Tidak ada siswa yang sesuai target";
    return;
  }

  // Ambil tagihan yang sudah ada di periode ini — hindari duplikat
  const tagihanSnap = await db
    .collection("tagihan")
    .where("periode", "==", periode)
    .get();
  const siswaIdSudahAda = new Set(
    tagihanSnap.docs.map((d) => d.data().siswaId),
  );

  const siswaList = siswaSnapList.filter((s) => !siswaIdSudahAda.has(s.id));

  if (siswaList.length === 0) {
    errEl.textContent = "Semua siswa target sudah memiliki tagihan untuk periode ini";
    return;
  }

  // Tampilkan progress
  Helpers.btnLoading("btn-buat-bulk", "Memproses...");
  const progressDiv = document.getElementById("bulk-progress");
  const progressBar = document.getElementById("bulk-progress-bar");
  const progressText = document.getElementById("bulk-progress-text");
  progressDiv.style.display = "block";
  errEl.textContent = "";

  let berhasil = 0;
  let gagal = 0;

  // Firestore batch write — max 500 operasi per batch
  const BATCH_SIZE = 499;
  for (let i = 0; i < siswaList.length; i += BATCH_SIZE) {
    const chunk = siswaList.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((siswa) => {
      const docRef = db.collection("tagihan").doc(); // auto ID
      batch.set(docRef, {
        siswaId: siswa.id,
        namaSiswa: siswa.nama,
        kelas: siswa.kelas || "",
        nis: siswa.nis || "",
        ortuId: siswa.ortuId || "",
        ortuNama: siswa.ortuNama || "",
        periode,
        nominal: parseInt(nominal),
        jatuhTempo,
        keterangan: keterangan || "SPP " + Helpers.periodeLabel(periode),
        status: "belum",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    try {
      await batch.commit();
      berhasil += chunk.length;
    } catch (err) {
      console.error("Batch error:", err);
      gagal += chunk.length;
    }

    // Update progress bar
    const persen = Math.round((berhasil / siswaList.length) * 100);
    progressBar.style.width = persen + "%";
    progressText.textContent = `Membuat tagihan... ${berhasil} dari ${siswaList.length} selesai`;
  }

  // Selesai
  if (gagal === 0) {
    Router.toast(`${berhasil} tagihan berhasil dibuat`);
  } else {
    Router.toast(`${berhasil} berhasil, ${gagal} gagal`);
  }

  tutupFormBulkTagihan();
  await loadTagihanAdmin();
  Helpers.btnReset("btn-buat-bulk");
}

/* ============================================================
   Form Tagihan Satu Siswa
   ============================================================ */

async function showFormTagihan() {
  const snap = await db.collection("siswa").orderBy("nama").get();
  const select = document.getElementById("tagihan-siswa-id");
  select.innerHTML = '<option value="">-- Pilih Siswa --</option>';
  snap.docs.forEach((doc) => {
    const s = doc.data();
    select.innerHTML += `<option value="${doc.id}" data-nama="${s.nama}" data-kelas="${s.kelas || ""}" data-nis="${s.nis || ""}" data-ortuid="${s.ortuId || ""}" data-ortunama="${s.ortuNama || ""}">${s.nama} (${s.kelas || "-"})</option>`;
  });

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("tagihan-jatuh-tempo").value = today;
  document.getElementById("tagihan-form-error").textContent = "";
  document.getElementById("modal-tagihan").classList.remove("hidden");
}

function tutupFormTagihan() {
  document.getElementById("modal-tagihan").classList.add("hidden");
}

async function simpanTagihan() {
  const siswaId = document.getElementById("tagihan-siswa-id").value;
  const periode = document.getElementById("tagihan-periode").value;
  const nominal = document.getElementById("tagihan-nominal").value;
  const jatuhTempo = document.getElementById("tagihan-jatuh-tempo").value;
  const keterangan = document.getElementById("tagihan-keterangan").value.trim();
  const errEl = document.getElementById("tagihan-form-error");

  if (!siswaId) {
    errEl.textContent = "Pilih siswa terlebih dahulu";
    return;
  }
  if (!periode) {
    errEl.textContent = "Periode wajib diisi";
    return;
  }
  if (!nominal || parseInt(nominal) < 1) {
    errEl.textContent = "Nominal harus lebih dari 0";
    return;
  }
  if (!jatuhTempo) {
    errEl.textContent = "Jatuh tempo wajib diisi";
    return;
  }

  // Cek duplikat
  const dupSnap = await db
    .collection("tagihan")
    .where("siswaId", "==", siswaId)
    .where("periode", "==", periode)
    .get();
  if (!dupSnap.empty) {
    errEl.textContent = "Tagihan untuk siswa ini di periode tersebut sudah ada";
    return;
  }

  const siswaOpt = document.querySelector(
    `#tagihan-siswa-id option[value="${siswaId}"]`,
  );
  const namaSiswa = siswaOpt ? siswaOpt.dataset.nama : "";
  const kelas = siswaOpt ? siswaOpt.dataset.kelas : "";
  const nis = siswaOpt ? siswaOpt.dataset.nis : "";
  const ortuId = siswaOpt ? siswaOpt.dataset.ortuid : "";
  const ortuNama = siswaOpt ? siswaOpt.dataset.ortunama : "";

  Helpers.btnLoading("btn-simpan-tagihan", "Menyimpan...");
  try {
    await db.collection("tagihan").add({
      siswaId,
      namaSiswa,
      kelas,
      nis,
      ortuId: ortuId || "",
      ortuNama: ortuNama || "",
      periode,
      nominal: parseInt(nominal),
      jatuhTempo,
      keterangan,
      status: "belum",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    Router.toast("Tagihan berhasil dibuat");
    tutupFormTagihan();
    await loadTagihanAdmin();
  } catch (err) {
    errEl.textContent = "Gagal menyimpan: " + err.message;
  } finally {
    Helpers.btnReset("btn-simpan-tagihan");
  }
}

/* ============================================================
   Catat Pembayaran Tunai
   ============================================================ */

function showModalTunai(tagihanId) {
  const tagihan = _tagihanAdminCached.find((t) => t.id === tagihanId);
  if (!tagihan) return;

  document.getElementById("tunai-tagihan-id").value = tagihanId;
  document.getElementById("tunai-info-text").textContent =
    `${tagihan.namaSiswa} — SPP ${Helpers.periodeLabel(tagihan.periode)} — ${Helpers.rupiah(tagihan.nominal)}`;
  document.getElementById("tunai-tanggal").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("tunai-ket").value = "";
  document.getElementById("tunai-form-error").textContent = "";
  document.getElementById("modal-tunai").classList.remove("hidden");
}

function tutupModalTunai() {
  document.getElementById("modal-tunai").classList.add("hidden");
}

async function konfirmasiTunai() {
  const tagihanId = document.getElementById("tunai-tagihan-id").value;
  const tanggal = document.getElementById("tunai-tanggal").value;
  const keterangan = document.getElementById("tunai-ket").value.trim();
  const errEl = document.getElementById("tunai-form-error");

  if (!tanggal) {
    errEl.textContent = "Tanggal pembayaran wajib diisi";
    return;
  }

  Helpers.btnLoading("btn-konfirmasi-tunai", "Memproses...");
  try {
    const tagihan = _tagihanAdminCached.find((t) => t.id === tagihanId) || {};
    let finalOrtuId = tagihan.ortuId || "";
    let finalOrtuNama = tagihan.ortuNama || "";

    // Sinkronkan ortuId dari profil siswa jika belum tercatat di tagihan
    if (!finalOrtuId && tagihan.siswaId) {
      try {
        const siswaDoc = await db.collection("siswa").doc(tagihan.siswaId).get();
        if (siswaDoc.exists) {
          finalOrtuId = siswaDoc.data().ortuId || "";
          finalOrtuNama = siswaDoc.data().ortuNama || "";
        }
      } catch (err) {
        console.warn("Gagal cek ortuId siswa:", err);
      }
    }

    await db.collection("transaksi").add({
      tagihanId,
      siswaId: tagihan.siswaId || "",
      namaSiswa: tagihan.namaSiswa || "",
      kelas: tagihan.kelas || "",
      nis: tagihan.nis || "",
      periode: tagihan.periode,
      nominal: tagihan.nominal,
      metode: "tunai",
      tanggal,
      keterangan,
      status: "lunas",
      ortuId: finalOrtuId,
      uid: finalOrtuId,
      ortuNama: finalOrtuNama,
      verifiedBy: Auth.getUid(),
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("tagihan").doc(tagihanId).update({
      status: "lunas",
      ortuId: finalOrtuId,
      ortuNama: finalOrtuNama,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Router.toast("Pembayaran tunai berhasil dicatat");
    tutupModalTunai();
    await loadTagihanAdmin();
  } catch (err) {
    errEl.textContent = "Gagal: " + err.message;
  } finally {
    Helpers.btnReset("btn-konfirmasi-tunai");
  }
}
