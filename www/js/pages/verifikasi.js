/* ============================================================
   Halaman Verifikasi Pembayaran (Admin)
   ============================================================ */

Router.register("verifikasi", {
  title: "Verifikasi Pembayaran",
  nav: true,
  requireAuth: true,
  role: "admin",

  render() {
    return `
            <div id="summary-verifikasi" class="summary-grid"></div>
            <div class="section-title">Menunggu Verifikasi</div>
            <div id="verifikasi-list"><div class="loading">Memuat data...</div></div>

            <!-- Modal Lihat Bukti Transfer -->
            <div id="modal-bukti" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title">Bukti Transfer</div>
                    <div id="bukti-preview" style="margin-bottom:16px;text-align:center"></div>
                    <div id="bukti-info" style="margin-bottom:16px"></div>
                    <div id="verif-form-error" class="form-error" style="margin-bottom:8px"></div>
                    <div class="form-group">
                        <label>Catatan (untuk revisi/tolak)</label>
                        <textarea id="verif-catatan" placeholder="Contoh: Foto bukti transfer tidak jelas, nominal tidak sesuai, dll..."></textarea>
                    </div>
                    <input type="hidden" id="verif-transaksi-id">
                    <input type="hidden" id="verif-tagihan-id">
                    <div class="flex gap-8">
                        <button class="btn btn-success" id="btn-konfirmasi-verif" onclick="aksiBuktiBayar('lunas')">✓ Konfirmasi</button>
                        <button class="btn btn-outline" onclick="aksiBuktiBayar('revisi')">↩ Revisi</button>
                    </div>
                    <div class="flex gap-8 mt-8">
                        <button class="btn btn-danger" onclick="aksiBuktiBayar('ditolak')">✕ Tolak</button>
                        <button class="btn btn-secondary" onclick="tutupModalBukti()">Tutup</button>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    await loadVerifikasi();
  },
});

let _verifikasiCached = [];

async function loadVerifikasi() {
  Helpers.loading("verifikasi-list");
  try {
    // Ambil transaksi dengan status menunggu — tanpa orderBy agar tidak perlu composite index
    const snap = await db
      .collection("transaksi")
      .where("status", "==", "menunggu")
      .get();

    // Summary semua status
    const allSnap = await db.collection("transaksi").get();
    const counts = { menunggu: 0, lunas: 0, revisi: 0, ditolak: 0 };
    allSnap.docs.forEach((d) => {
      const s = d.data().status;
      if (counts[s] !== undefined) counts[s]++;
    });

    const summaryEl = document.getElementById("summary-verifikasi");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card info"><div class="summary-number">${counts.menunggu}</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">${counts.lunas}</div><div class="summary-label">Dikonfirmasi</div></div>
                <div class="summary-card warning"><div class="summary-number">${counts.revisi}</div><div class="summary-label">Perlu Revisi</div></div>
                <div class="summary-card danger"><div class="summary-number">${counts.ditolak}</div><div class="summary-label">Ditolak</div></div>
            `;
    }

    if (snap.empty) {
      Helpers.emptyState(
        "verifikasi-list",
        "✅",
        "Tidak ada pembayaran yang perlu diverifikasi",
      );
      return;
    }

    _verifikasiCached = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderVerifikasi(_verifikasiCached);
  } catch (err) {
    console.error(err);
    Helpers.errorState("verifikasi-list", "Gagal memuat: " + err.message);
  }
}

function renderVerifikasi(list) {
  const container = document.getElementById("verifikasi-list");
  if (!container) return;

  container.innerHTML = list
    .map(
      (t) => `
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
                <span class="card-label">Tanggal Upload</span>
                <span class="card-value">${Helpers.tanggal(t.createdAt)}</span>
            </div>
            <button class="btn btn-primary mt-8" onclick="showModalBukti('${t.id}')">
                Lihat Bukti &amp; Verifikasi
            </button>
        </div>
    `,
    )
    .join("");
}

function showModalBukti(transaksiId) {
  const t = _verifikasiCached.find((x) => x.id === transaksiId);
  if (!t) return;

  document.getElementById("verif-transaksi-id").value = transaksiId;
  document.getElementById("verif-tagihan-id").value = t.tagihanId || "";
  document.getElementById("verif-catatan").value = "";
  document.getElementById("verif-form-error").textContent = "";

  // Info transaksi
  const infoEl = document.getElementById("bukti-info");
  infoEl.innerHTML = `
        <div class="card-row"><span class="card-label">Siswa</span><span class="card-value">${t.namaSiswa}</span></div>
        <div class="card-row"><span class="card-label">Periode</span><span class="card-value">SPP ${Helpers.periodeLabel(t.periode)}</span></div>
        <div class="card-row"><span class="card-label">Nominal</span><span class="card-value font-semibold">${Helpers.rupiah(t.nominal)}</span></div>
        <div class="card-row"><span class="card-label">Metode</span><span class="card-value">Transfer Bank</span></div>
    `;

  // Preview bukti
  const previewEl = document.getElementById("bukti-preview");
  if (t.buktiUrl) {
    // Cek apakah PDF atau gambar
    if (t.buktiUrl.includes(".pdf") || t.buktiTipe === "application/pdf") {
      previewEl.innerHTML = `
                <a href="${t.buktiUrl}" target="_blank" class="btn btn-outline">
                    📄 Buka File PDF
                </a>
            `;
    } else {
      previewEl.innerHTML = `
                <img src="${t.buktiUrl}"
                     style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)"
                     alt="Bukti transfer"
                     onerror="this.outerHTML='<p class=text-secondary>Gagal memuat gambar</p>'">
            `;
    }
  } else {
    previewEl.innerHTML =
      '<p class="text-secondary">Tidak ada bukti yang dilampirkan</p>';
  }

  document.getElementById("modal-bukti").classList.remove("hidden");
}

function tutupModalBukti() {
  document.getElementById("modal-bukti").classList.add("hidden");
}

async function aksiBuktiBayar(aksi) {
  const transaksiId = document.getElementById("verif-transaksi-id").value;
  const tagihanId = document.getElementById("verif-tagihan-id").value;
  const catatan = document.getElementById("verif-catatan").value.trim();
  const errEl = document.getElementById("verif-form-error");

  // Catatan wajib untuk revisi/tolak
  if ((aksi === "revisi" || aksi === "ditolak") && !catatan) {
    errEl.textContent = "Catatan wajib diisi untuk revisi atau penolakan";
    return;
  }

  const pesanKonfirmasi = {
    lunas: "Konfirmasi pembayaran ini sebagai LUNAS?",
    revisi: "Minta orang tua untuk merevisi bukti transfer?",
    ditolak:
      "Tolak pembayaran ini? Orang tua perlu melakukan pembayaran ulang.",
  };

  const ok = await Helpers.confirm(pesanKonfirmasi[aksi]);
  if (!ok) return;

  try {
    // Update status transaksi
    await db
      .collection("transaksi")
      .doc(transaksiId)
      .update({
        status: aksi,
        catatan: catatan || "",
        verifiedBy: Auth.getUid(),
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Update status tagihan juga
    if (tagihanId) {
      await db.collection("tagihan").doc(tagihanId).update({
        status: aksi,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    const pesanHasil = {
      lunas: "Pembayaran berhasil dikonfirmasi ✓",
      revisi: "Pembayaran ditandai perlu revisi",
      ditolak: "Pembayaran ditolak",
    };

    Router.toast(pesanHasil[aksi]);
    tutupModalBukti();
    await loadVerifikasi();
  } catch (err) {
    errEl.textContent = "Gagal memperbarui: " + err.message;
  }
}
