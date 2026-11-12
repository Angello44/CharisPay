/* ============================================================
   Halaman Detail Tagihan (Orang Tua)
   ============================================================ */

Router.register("detail-tagihan", {
  title: "Detail Tagihan",
  back: true,
  backTo: "tagihan",
  nav: false,
  requireAuth: true,
  role: "ortu",

  render(params) {
    return `<div id="detail-tagihan-content"><div class="loading">Memuat detail...</div></div>`;
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

      // Cek apakah sudah ada transaksi untuk tagihan ini
      const transaksiSnap = await db
        .collection("transaksi")
        .where("tagihanId", "==", id)
        .get();

      // Ambil yang terbaru secara client-side
      const transaksiDocs = transaksiSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      transaksiDocs.sort((a, b) => {
        const ta = a.createdAt ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      const transaksiTerakhir =
        transaksiDocs.length > 0 ? transaksiDocs[0] : null;

      const container = document.getElementById("detail-tagihan-content");

      // Tentukan tombol aksi berdasarkan status
      let actionSection = "";

      if (t.status === "belum") {
        actionSection = `<button class="btn btn-primary" onclick="Router.go('pembayaran', '${id}')">Bayar Sekarang</button>`;
      } else if (t.status === "menunggu") {
        actionSection = `
                    <div class="card" style="background:var(--info-light)">
                        <p class="text-sm" style="color:var(--info)">
                            ⏳ Bukti transfer Anda sedang diperiksa oleh admin. Harap tunggu konfirmasi.
                        </p>
                    </div>
                `;
      } else if (t.status === "lunas") {
        actionSection = `
                    <div class="card" style="background:var(--success-light)">
                        <p class="text-sm" style="color:var(--success)">
                            ✅ Pembayaran telah lunas. Terima kasih!
                        </p>
                    </div>
                `;
      } else if (t.status === "revisi") {
        actionSection = `
                    <div class="card" style="background:var(--warning-light)">
                        <p class="text-sm" style="color:var(--warning)">
                            ⚠️ Bukti transfer perlu diperbaiki.
                            ${transaksiTerakhir && transaksiTerakhir.catatan ? `<br>Catatan admin: <strong>${transaksiTerakhir.catatan}</strong>` : ""}
                        </p>
                    </div>
                    <button class="btn btn-primary mt-8" onclick="Router.go('pembayaran', '${id}')">Upload Ulang Bukti</button>
                `;
      } else if (t.status === "ditolak") {
        actionSection = `
                    <div class="card" style="background:var(--danger-light)">
                        <p class="text-sm" style="color:var(--danger)">
                            ❌ Pembayaran ditolak.
                            ${transaksiTerakhir && transaksiTerakhir.catatan ? `<br>Alasan: <strong>${transaksiTerakhir.catatan}</strong>` : ""}
                        </p>
                    </div>
                    <button class="btn btn-primary mt-8" onclick="Router.go('pembayaran', '${id}')">Bayar Ulang</button>
                `;
      }

      container.innerHTML = `
                <div class="card">
                    <div class="card-title">Informasi Tagihan</div>
                    <div class="card-row">
                        <span class="card-label">Periode</span>
                        <span class="card-value">SPP ${Helpers.periodeLabel(t.periode)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Nominal</span>
                        <span class="card-value font-semibold">${Helpers.rupiah(t.nominal)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Jatuh Tempo</span>
                        <span class="card-value">${t.jatuhTempo || "-"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Status</span>
                        ${Helpers.badge(t.status)}
                    </div>
                    ${
                      t.keterangan
                        ? `
                    <div class="card-row">
                        <span class="card-label">Keterangan</span>
                        <span class="card-value">${t.keterangan}</span>
                    </div>`
                        : ""
                    }
                </div>

                <div class="card">
                    <div class="card-title">Data Siswa</div>
                    <div class="card-row">
                        <span class="card-label">Nama</span>
                        <span class="card-value">${t.namaSiswa || "-"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Kelas</span>
                        <span class="card-value">${t.kelas || "-"}</span>
                    </div>
                </div>

                ${
                  transaksiTerakhir
                    ? `
                <div class="card">
                    <div class="card-title">Riwayat Pembayaran Terakhir</div>
                    <div class="card-row">
                        <span class="card-label">Metode</span>
                        <span class="card-value">${transaksiTerakhir.metode === "tunai" ? "Tunai" : "Transfer Bank"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Tanggal</span>
                        <span class="card-value">${Helpers.tanggal(transaksiTerakhir.createdAt)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Status</span>
                        ${Helpers.badge(transaksiTerakhir.status)}
                    </div>
                </div>`
                    : ""
                }

                ${actionSection}
            `;
    } catch (err) {
      console.error(err);
      Helpers.errorState(
        "detail-tagihan-content",
        "Gagal memuat detail: " + err.message,
      );
    }
  },
});
