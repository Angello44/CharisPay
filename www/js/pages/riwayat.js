/* ============================================================
   Halaman Riwayat Pembayaran (Orang Tua)
   ============================================================ */

Router.register("riwayat", {
  title: "Riwayat Pembayaran",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
            <div class="section-title">Riwayat Transaksi</div>
            <div id="riwayat-list"><div class="loading">Memuat riwayat...</div></div>
        `;
  },

  async init() {
    await loadRiwayat();
  },
});

async function loadRiwayat() {
  Helpers.loading("riwayat-list");
  try {
    const uid = Auth.getUid();

    // Ambil semua transaksi milik user ini
    const snap = await db.collection("transaksi").where("uid", "==", uid).get();

    if (snap.empty) {
      Helpers.emptyState("riwayat-list", "🧾", "Belum ada riwayat pembayaran");
      return;
    }

    const transaksi = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Urutkan client-side: terbaru dulu
    transaksi.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    const container = document.getElementById("riwayat-list");

    container.innerHTML = transaksi
      .map((t) => {
        const metodeLabel = t.metode === "tunai" ? "💵 Tunai" : "🏦 Transfer";
        const tanggal = Helpers.tanggal(t.createdAt);

        return `
                <div class="list-item" onclick="showDetailRiwayat('${t.id}')">
                    <div class="list-item-left">
                        <div class="list-item-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
                        <div class="list-item-subtitle">${metodeLabel} &middot; ${tanggal}</div>
                    </div>
                    <div class="list-item-right">
                        <div class="list-item-amount">${Helpers.rupiah(t.nominal)}</div>
                        ${Helpers.badge(t.status)}
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    Helpers.errorState("riwayat-list", "Gagal memuat: " + err.message);
  }
}

// Simpan cache transaksi untuk modal detail
let _riwayatCached = [];

async function showDetailRiwayat(id) {
  // Ambil dari Firestore
  const doc = await db.collection("transaksi").doc(id).get();
  if (!doc.exists) return;
  const t = { id: doc.id, ...doc.data() };

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modal-riwayat-detail";
  overlay.innerHTML = `
        <div class="modal" style="max-height:90vh;overflow-y:auto">
            <div class="modal-title">Detail Transaksi</div>

            <div class="card-row"><span class="card-label">Siswa</span><span class="card-value">${t.namaSiswa || "-"}</span></div>
            <div class="card-row"><span class="card-label">Periode</span><span class="card-value">SPP ${Helpers.periodeLabel(t.periode)}</span></div>
            <div class="card-row"><span class="card-label">Nominal</span><span class="card-value font-semibold">${Helpers.rupiah(t.nominal)}</span></div>
            <div class="card-row"><span class="card-label">Metode</span><span class="card-value">${t.metode === "tunai" ? "Tunai" : "Transfer Bank"}</span></div>
            <div class="card-row"><span class="card-label">Tanggal</span><span class="card-value">${Helpers.tanggal(t.createdAt)}</span></div>
            <div class="card-row"><span class="card-label">Status</span>${Helpers.badge(t.status)}</div>

            ${t.catatan ? `<div class="card-row"><span class="card-label">Catatan Admin</span><span class="card-value" style="color:var(--danger)">${t.catatan}</span></div>` : ""}

            ${
              t.buktiUrl
                ? `
            <div style="margin:16px 0;text-align:center">
                <p class="text-sm text-secondary mb-8">Bukti Transfer:</p>
                ${
                  t.buktiTipe === "application/pdf"
                    ? `<a href="${t.buktiUrl}" target="_blank" class="btn btn-outline">📄 Buka PDF</a>`
                    : `<img src="${t.buktiUrl}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)" alt="Bukti">`
                }
            </div>`
                : ""
            }

            <button class="btn btn-secondary mt-16" onclick="document.getElementById('modal-riwayat-detail').remove()">Tutup</button>
        </div>
    `;
  document.body.appendChild(overlay);
}
