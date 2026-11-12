/* ============================================================
   Halaman Detail Tagihan (Orang Tua - Clean Vector UI)
   ============================================================ */

Router.register("detail-tagihan", {
  title: "Rincian Tagihan",
  back: true,
  backTo: "tagihan",
  nav: false,
  requireAuth: true,
  role: "ortu",

  render(params) {
    return `<div id="detail-tagihan-content"><div class="loading">Memuat detail tagihan...</div></div>`;
  },

  async init(params) {
    const id = params[0];
    if (!id) {
      Router.go("tagihan");
      return;
    }

    try {
      const doc = await db.collection("tagihan").doc(id).get();
      if (!doc.exists) {
        Helpers.errorState("detail-tagihan-content", "Tagihan tidak ditemukan");
        return;
      }

      const t = { id: doc.id, ...doc.data() };

      const transaksiSnap = await db
        .collection("transaksi")
        .where("tagihanId", "==", id)
        .get();

      const transaksiDocs = transaksiSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      transaksiDocs.sort((a, b) => {
        const ta = a.createdAt ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      const transaksiTerakhir = transaksiDocs.length > 0 ? transaksiDocs[0] : null;

      const container = document.getElementById("detail-tagihan-content");

      let statusBanner = "";
      let actionBtn = "";

      if (t.status === "belum") {
        statusBanner = `
          <div class="card" style="background:#fffbeb;border-color:#fde68a;text-align:center;padding:16px">
            <div class="empty-state-icon" style="color:#d97706;background:#fef3c7;margin-bottom:8px">${Icons.warning}</div>
            <div class="font-bold text-sm" style="color:#b45309">Tagihan Belum Dibayar</div>
            <p class="text-xs text-secondary mt-4">Jatuh tempo: ${t.jatuhTempo || "-"}. Silakan lakukan pembayaran.</p>
          </div>
        `;
        actionBtn = `
          <button class="btn btn-primary" onclick="Router.go('pembayaran', '${id}')">
            ${Icons.wallet} Bayar Tagihan Sekarang
          </button>
        `;
      } else if (t.status === "menunggu") {
        statusBanner = `
          <div class="card" style="background:#e0f2fe;border-color:#bae6fd;text-align:center;padding:16px">
            <div class="empty-state-icon" style="color:#0284c7;background:#e0f2fe;margin-bottom:8px">${Icons.clock}</div>
            <div class="font-bold text-sm" style="color:#0369a1">Sedang Diverifikasi Admin</div>
            <p class="text-xs text-secondary mt-4">Bukti transfer telah dikirim dan sedang ditinjau petugas sekolah.</p>
          </div>
        `;
        actionBtn = `
          <button class="btn btn-secondary" onclick="Router.go('tagihan')">
            Kembali ke Daftar Tagihan
          </button>
        `;
      } else if (t.status === "lunas") {
        statusBanner = `
          <div class="card" style="background:#ecfdf5;border-color:#a7f3d0;text-align:center;padding:16px">
            <div class="empty-state-icon" style="color:#10b981;background:#dcfce7;margin-bottom:8px">${Icons.checkCircle}</div>
            <div class="font-bold text-sm" style="color:#047857">Tagihan Telah Lunas</div>
            <p class="text-xs text-secondary mt-4">Terima kasih telah membayar tepat waktu!</p>
          </div>
        `;
        actionBtn = `
          <button class="btn btn-secondary" onclick="Router.go('tagihan')">
            Kembali ke Daftar Tagihan
          </button>
        `;
      } else if (t.status === "revisi") {
        statusBanner = `
          <div class="card" style="background:#fffbeb;border-color:#fde68a;text-align:center;padding:16px">
            <div class="empty-state-icon" style="color:#d97706;background:#fef3c7;margin-bottom:8px">${Icons.alertCircle}</div>
            <div class="font-bold text-sm" style="color:#b45309">Bukti Pembayaran Perlu Revisi</div>
            <p class="text-xs text-secondary mt-4">
              ${transaksiTerakhir && transaksiTerakhir.catatan ? `Catatan Petugas: <strong>"${transaksiTerakhir.catatan}"</strong>` : "Bukti transfer belum jelas atau nominal tidak sesuai."}
            </p>
          </div>
        `;
        actionBtn = `
          <button class="btn btn-primary" onclick="Router.go('pembayaran', '${id}')">
            ${Icons.camera} Upload Ulang Bukti Transfer
          </button>
        `;
      } else if (t.status === "ditolak") {
        statusBanner = `
          <div class="card" style="background:#fee2e2;border-color:#fecaca;text-align:center;padding:16px">
            <div class="empty-state-icon" style="color:#dc2626;background:#fee2e2;margin-bottom:8px">${Icons.cross}</div>
            <div class="font-bold text-sm" style="color:#b91c1c">Pembayaran Ditolak</div>
            <p class="text-xs text-secondary mt-4">
              ${transaksiTerakhir && transaksiTerakhir.catatan ? `Alasan: <strong>"${transaksiTerakhir.catatan}"</strong>` : "Silakan bayar ulang atau hubungi bagian keuangan sekolah."}
            </p>
          </div>
        `;
        actionBtn = `
          <button class="btn btn-primary" onclick="Router.go('pembayaran', '${id}')">
            ${Icons.wallet} Bayar Ulang Tagihan
          </button>
        `;
      }

      container.innerHTML = `
        ${statusBanner}

        <!-- Kartu Rincian Faktur / Invoice -->
        <div class="invoice-card">
          <div class="invoice-header">
            <div class="invoice-school-title">Charis Institute</div>
            <div class="invoice-subtitle">Faktur Pembayaran SPP Sekolah</div>
          </div>

          <div class="invoice-total-box">
            <div class="invoice-total-label">Total Nominal Tagihan</div>
            <div class="invoice-total-val">${Helpers.rupiah(t.nominal)}</div>
          </div>

          <div class="card-row">
            <span class="card-label">Periode Pembayaran</span>
            <span class="card-value">SPP ${Helpers.periodeLabel(t.periode)}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Nama Siswa</span>
            <span class="card-value font-bold">${t.namaSiswa || "-"}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Kelas Siswa</span>
            <span class="card-value">${t.kelas || "-"}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Batas Jatuh Tempo</span>
            <span class="card-value">${t.jatuhTempo || "-"}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Status Tagihan</span>
            <span class="card-value">${Helpers.badge(t.status)}</span>
          </div>
          ${
            t.keterangan
              ? `
            <div class="card-row">
              <span class="card-label">Catatan Tagihan</span>
              <span class="card-value">${t.keterangan}</span>
            </div>`
              : ""
          }
        </div>

        ${
          transaksiTerakhir
            ? `
          <div class="card">
            <div class="card-title">Riwayat Kiriman Terakhir</div>
            <div class="card-row">
              <span class="card-label">Metode Pembayaran</span>
              <span class="card-value">${transaksiTerakhir.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Waktu Kirim</span>
              <span class="card-value">${Helpers.tanggal(transaksiTerakhir.createdAt)}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Status Kiriman</span>
              <span class="card-value">${Helpers.badge(transaksiTerakhir.status)}</span>
            </div>
          </div>
        `
            : ""
        }

        <div class="mt-16">
          ${actionBtn}
        </div>
      `;
    } catch (err) {
      console.error(err);
      Helpers.errorState("detail-tagihan-content", "Gagal memuat detail: " + err.message);
    }
  },
});
