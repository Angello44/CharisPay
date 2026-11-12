/* ============================================================
   Halaman Riwayat Pembayaran (Orang Tua - Clean Vector UI)
   ============================================================ */

Router.register("riwayat", {
  title: "Riwayat Transaksi",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
      <div id="riwayat-list"><div class="loading">Memuat riwayat pembayaran...</div></div>
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

    const snap = await db.collection("transaksi").where("uid", "==", uid).get();

    if (snap.empty) {
      Helpers.emptyState("riwayat-list", Icons.receipt, "Belum ada riwayat transaksi yang tercatat.");
      return;
    }

    const transaksi = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    transaksi.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    const container = document.getElementById("riwayat-list");

    container.innerHTML = `
      <div class="section-title mb-12">Semua Transaksi (${transaksi.length})</div>
      ${transaksi
        .map((t) => {
          const metodeLabel = t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank BCA";
          const tanggal = Helpers.tanggal(t.createdAt);
          const isLunas = t.status === "lunas";

          return `
            <div class="bill-card" onclick="showDetailRiwayat('${t.id}')">
              <div class="bill-card-left">
                <div class="bill-icon-box" style="${isLunas ? 'background:#dcfce7;color:#16a34a' : ''}">
                  ${isLunas ? Icons.checkCircle : Icons.receipt}
                </div>
                <div class="bill-card-info">
                  <div class="bill-card-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
                  <div class="bill-card-meta">
                    <span>${metodeLabel}</span>
                    <span>&bull;</span>
                    <span>${tanggal}</span>
                  </div>
                </div>
              </div>
              <div class="bill-card-right">
                <div class="bill-card-amount">${Helpers.rupiah(t.nominal)}</div>
                ${Helpers.badge(t.status)}
              </div>
            </div>
          `;
        })
        .join("")}
    `;
  } catch (err) {
    console.error("Gagal load riwayat:", err);
    Helpers.errorState("riwayat-list", "Gagal memuat: " + err.message);
  }
}

async function showDetailRiwayat(id) {
  try {
    const doc = await db.collection("transaksi").doc(id).get();
    if (!doc.exists) return;
    const t = { id: doc.id, ...doc.data() };

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-riwayat-detail";
    overlay.innerHTML = `
      <div class="modal" style="max-height:92vh;overflow-y:auto;padding:20px">
        <div class="invoice-header" style="border-bottom:2px dashed var(--border);padding-bottom:12px;margin-bottom:14px;text-align:center">
          <div class="empty-state-icon" style="color:var(--primary);background:var(--primary-light);margin-bottom:6px">${Icons.receipt}</div>
          <div class="font-bold text-sm" style="color:var(--text)">Kwitansi Pembayaran</div>
          <div class="text-xs text-secondary">Charis Institute &bull; ID: ${t.id.substring(0, 8).toUpperCase()}</div>
        </div>

        <div class="card-row">
          <span class="card-label">Status Verifikasi</span>
          <span>${Helpers.badge(t.status)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Siswa</span>
          <span class="card-value font-bold">${t.namaSiswa || "-"} (${t.kelas || "-"})</span>
        </div>
        <div class="card-row">
          <span class="card-label">Periode SPP</span>
          <span class="card-value">SPP ${Helpers.periodeLabel(t.periode)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Total Dibayar</span>
          <span class="card-value font-bold" style="color:var(--primary);font-size:15px">${Helpers.rupiah(t.nominal)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Metode</span>
          <span class="card-value">${t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank BCA"}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Waktu Transaksi</span>
          <span class="card-value">${Helpers.tanggal(t.createdAt)}</span>
        </div>

        ${
          t.catatan
            ? `
          <div class="card" style="background:#fffbeb;border-color:#fde68a;margin-top:10px;padding:10px">
            <div class="text-xs font-bold" style="color:#b45309">Catatan Petugas:</div>
            <div class="text-xs text-secondary mt-2">${t.catatan}</div>
          </div>
        `
            : ""
        }

        ${
          t.buktiUrl
            ? `
          <div style="margin:16px 0;text-align:center">
            <div class="text-xs font-bold text-secondary mb-8">Berkas Bukti Transfer:</div>
            ${
              t.buktiTipe === "application/pdf"
                ? `<a href="${t.buktiUrl}" target="_blank" class="btn btn-outline btn-sm">${Icons.fileText} Buka Dokumen PDF</a>`
                : `<img src="${t.buktiUrl}" style="max-width:100%;max-height:220px;border-radius:10px;border:1px solid var(--border);box-shadow:var(--shadow-sm)" alt="Bukti Transfer">`
            }
          </div>
        `
            : ""
        }

        <button class="btn btn-secondary mt-16 w-full" onclick="document.getElementById('modal-riwayat-detail').remove()">
          Tutup
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (err) {
    console.error(err);
  }
}
