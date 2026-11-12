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
  action: "showFormTagihan()",
  actionIcon: "+",

  render() {
    return `
            <div class="form-group flex gap-8" style="margin-bottom:0">
                <select id="filter-status-tagihan" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                    <option value="">Semua Status</option>
                    <option value="belum">Belum Dibayar</option>
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="lunas">Lunas</option>
                    <option value="revisi">Perlu Revisi</option>
                    <option value="ditolak">Ditolak</option>
                </select>
            </div>

            <div id="summary-tagihan" class="summary-grid" style="margin-top:12px"></div>
            <div id="tagihan-admin-list"><div class="loading">Memuat tagihan...</div></div>

            <!-- Modal Form Tagihan -->
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
                        <textarea id="tagihan-keterangan" placeholder="cth: SPP bulan November 2026"></textarea>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="tutupFormTagihan()">Batal</button>
                        <button class="btn btn-primary" id="btn-simpan-tagihan" onclick="simpanTagihan()">Buat Tagihan</button>
                    </div>
                </div>
            </div>

            <!-- Modal Catat Pembayaran Tunai -->
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
                        <button class="btn btn-success" id="btn-konfirmasi-tunai" onclick="konfirmasiTunai()">Konfirmasi Lunas</button>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    await loadTagihanAdmin();
    document
      .getElementById("filter-status-tagihan")
      .addEventListener("change", function () {
        loadTagihanAdmin(this.value);
      });
  },
});

let _tagihanAdminCached = [];

async function loadTagihanAdmin(filterStatus = "") {
  Helpers.loading("tagihan-admin-list");
  try {
    let query = db.collection("tagihan");
    if (filterStatus) query = query.where("status", "==", filterStatus);

    const snap = await query.get();

    // Hitung summary
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
        "📄",
        "Belum ada tagihan. Tap + untuk membuat.",
      );
      return;
    }

    _tagihanAdminCached = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort client-side: terbaru dulu
    _tagihanAdminCached.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    renderTagihanAdmin(_tagihanAdminCached);
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
      const statusInfo = Helpers.statusInfo(t.status);
      const periodeLabel = Helpers.periodeLabel(t.periode);

      // Tombol aksi berdasarkan status
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
                        <div class="text-sm text-secondary">${t.kelas || ""} &middot; SPP ${periodeLabel}</div>
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

async function showFormTagihan() {
  // Ambil daftar siswa untuk dropdown
  const snap = await db.collection("siswa").orderBy("nama").get();
  const select = document.getElementById("tagihan-siswa-id");
  select.innerHTML = '<option value="">-- Pilih Siswa --</option>';
  snap.docs.forEach((doc) => {
    const s = doc.data();
    select.innerHTML += `<option value="${doc.id}" data-nama="${s.nama}" data-kelas="${s.kelas}">${s.nama} (${s.kelas})</option>`;
  });

  // Default tanggal hari ini
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

  // Validasi
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

  // Cek duplikat tagihan (siswa + periode yang sama)
  const dupSnap = await db
    .collection("tagihan")
    .where("siswaId", "==", siswaId)
    .where("periode", "==", periode)
    .get();
  if (!dupSnap.empty) {
    errEl.textContent = "Tagihan untuk siswa ini di periode tersebut sudah ada";
    return;
  }

  // Ambil data siswa
  const siswaOpt = document.querySelector(
    `#tagihan-siswa-id option[value="${siswaId}"]`,
  );
  const namaSiswa = siswaOpt ? siswaOpt.dataset.nama : "";
  const kelas = siswaOpt ? siswaOpt.dataset.kelas : "";

  Helpers.btnLoading("btn-simpan-tagihan", "Menyimpan...");
  try {
    await db.collection("tagihan").add({
      siswaId,
      namaSiswa,
      kelas,
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
    const tagihan = _tagihanAdminCached.find((t) => t.id === tagihanId);

    // Simpan transaksi
    await db.collection("transaksi").add({
      tagihanId,
      siswaId: tagihan.siswaId,
      namaSiswa: tagihan.namaSiswa,
      kelas: tagihan.kelas,
      periode: tagihan.periode,
      nominal: tagihan.nominal,
      metode: "tunai",
      tanggal,
      keterangan,
      status: "lunas",
      verifiedBy: Auth.getUid(),
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Update status tagihan
    await db.collection("tagihan").doc(tagihanId).update({
      status: "lunas",
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
