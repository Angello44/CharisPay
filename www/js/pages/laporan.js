/* ============================================================
   Halaman Laporan Pembayaran (Admin)
   ============================================================ */

Router.register("laporan", {
  title: "Laporan Pembayaran",
  nav: true,
  requireAuth: true,
  role: "admin",

  render() {
    return `
            <div class="form-group flex gap-8" style="margin-bottom:10px;flex-wrap:wrap">
                <input type="month" id="filter-periode-laporan"
                       style="flex:1;min-width:160px;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                <button class="btn btn-primary btn-sm" onclick="loadLaporan()" style="width:auto;padding:0 20px">Filter</button>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
                <button class="btn btn-secondary btn-sm" onclick="exportLaporanPembayaranExcel()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
                    ${Icons.receipt} Export Laporan Pembayaran
                </button>
                <button class="btn btn-outline btn-sm" onclick="exportDaftarTunggakanExcel()" style="width:auto;display:inline-flex;align-items:center;gap:6px">
                    ${Icons.alertCircle} Export Daftar Tunggakan
                </button>
            </div>
            <div id="laporan-content"><div class="loading">Memuat laporan...</div></div>
        `;
  },

  async init() {
    // Default: bulan ini
    const now = new Date();
    const bulanIni =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    document.getElementById("filter-periode-laporan").value = bulanIni;
    await loadLaporan();
  },
});

async function loadLaporan() {
  const periode = document.getElementById("filter-periode-laporan").value;
  Helpers.loading("laporan-content");

  try {
    // Ambil semua tagihan bulan ini (atau semua kalau tidak difilter)
    let tagihanQuery = db.collection("tagihan");
    if (periode) tagihanQuery = tagihanQuery.where("periode", "==", periode);
    const tagihanSnap = await tagihanQuery.get();

    // Ambil semua transaksi lunas periode ini
    let transaksiQuery = db
      .collection("transaksi")
      .where("status", "==", "lunas");
    if (periode)
      transaksiQuery = transaksiQuery.where("periode", "==", periode);
    const transaksiSnap = await transaksiQuery.get();

    // Hitung statistik
    const counts = { belum: 0, menunggu: 0, lunas: 0, revisi: 0, ditolak: 0 };
    let totalTagihan = 0;
    tagihanSnap.docs.forEach((d) => {
      const t = d.data();
      totalTagihan += t.nominal || 0;
      if (counts[t.status] !== undefined) counts[t.status]++;
    });

    let totalTerkumpul = 0;
    let totalTunai = 0;
    let totalTransfer = 0;
    const perKelas = {};

    transaksiSnap.docs.forEach((d) => {
      const t = d.data();
      totalTerkumpul += t.nominal || 0;
      if (t.metode === "tunai") totalTunai += t.nominal || 0;
      else totalTransfer += t.nominal || 0;

      // Per kelas
      const kelas = t.kelas || "Tidak diketahui";
      if (!perKelas[kelas]) perKelas[kelas] = { lunas: 0, total: 0 };
      perKelas[kelas].lunas++;
    });

    // Hitung total siswa per kelas untuk persentase
    const totalPerKelas = {};
    tagihanSnap.docs.forEach((d) => {
      const kelas = d.data().kelas || "Tidak diketahui";
      if (!totalPerKelas[kelas]) totalPerKelas[kelas] = 0;
      totalPerKelas[kelas]++;
    });

    // Breakdown per jenis tagihan
    const perJenis = {};
    const listJenis = typeof DAFTAR_JENIS_TAGIHAN !== "undefined"
      ? DAFTAR_JENIS_TAGIHAN
      : ["SPP", "Uang Gedung", "Uang Outing Class", "Uang Seragam", "Lainnya"];
    listJenis.forEach((j) => {
      perJenis[j] = { total: 0, nominal: 0, lunasCount: 0, lunasNominal: 0 };
    });

    tagihanSnap.docs.forEach((d) => {
      const t = d.data();
      const j = t.jenisTagihan || "SPP";
      if (!perJenis[j]) {
        perJenis[j] = { total: 0, nominal: 0, lunasCount: 0, lunasNominal: 0 };
      }
      perJenis[j].total++;
      perJenis[j].nominal += t.nominal || 0;
      if (t.status === "lunas") {
        perJenis[j].lunasCount++;
        perJenis[j].lunasNominal += t.nominal || 0;
      }
    });

    const jenisRows = Object.entries(perJenis)
      .filter(([_, data]) => data.total > 0)
      .map(([jenis, data]) => {
        const pLunas =
          data.nominal > 0
            ? ((data.lunasNominal / data.nominal) * 100).toFixed(0)
            : 0;
        return `
          <div class="card-row" style="align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border-light)">
            <div>
              <div class="font-semibold text-sm" style="color:var(--text)">${jenis}</div>
              <div class="text-xs text-secondary">${data.total} tagihan &bull; ${data.lunasCount} lunas (${pLunas}%)</div>
            </div>
            <div style="text-align:right">
              <div class="font-bold text-sm" style="color:var(--text)">${Helpers.rupiah(data.nominal)}</div>
              <div class="text-xs" style="color:var(--success)">Lunas: ${Helpers.rupiah(data.lunasNominal)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    const totalBelumTerkumpul = totalTagihan - totalTerkumpul;
    const persen =
      totalTagihan > 0 ? ((totalTerkumpul / totalTagihan) * 100).toFixed(1) : 0;

    const periodeLabel = periode
      ? Helpers.periodeLabel(periode)
      : "Semua Periode";

    // Render laporan
    const kelasRows = Object.entries(perKelas)
      .map(([kelas, data]) => {
        const total = totalPerKelas[kelas] || 1;
        const p = ((data.lunas / total) * 100).toFixed(0);
        return `
                <div class="card-row">
                    <span class="card-label">${kelas}</span>
                    <span class="card-value">${data.lunas}/${total} (${p}% lunas)</span>
                </div>
            `;
      })
      .join("");

    document.getElementById("laporan-content").innerHTML = `
            <div class="card">
                <div class="card-title">Ringkasan — ${periodeLabel}</div>
                <div class="card-row">
                    <span class="card-label">Total Tagihan</span>
                    <span class="card-value font-semibold">${Helpers.rupiah(totalTagihan)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Terkumpul</span>
                    <span class="card-value font-semibold" style="color:var(--success)">${Helpers.rupiah(totalTerkumpul)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Belum Terkumpul</span>
                    <span class="card-value font-semibold" style="color:var(--danger)">${Helpers.rupiah(totalBelumTerkumpul)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Persentase Lunas</span>
                    <span class="badge badge-lunas">${persen}% Lunas</span>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Status Tagihan</div>
                <div class="card-row">
                    <span class="card-label">Sudah Lunas</span>
                    <span class="card-value" style="color:var(--success)">${counts.lunas} tagihan</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Belum Dibayar</span>
                    <span class="card-value" style="color:var(--warning)">${counts.belum} tagihan</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Menunggu Verifikasi</span>
                    <span class="card-value" style="color:var(--info)">${counts.menunggu} tagihan</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Perlu Revisi</span>
                    <span class="card-value" style="color:var(--warning)">${counts.revisi} tagihan</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Ditolak</span>
                    <span class="card-value" style="color:var(--danger)">${counts.ditolak} tagihan</span>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Breakdown Berdasarkan Jenis Tagihan</div>
                ${jenisRows || '<p class="text-sm text-secondary">Belum ada data tagihan pada periode ini</p>'}
            </div>

            <div class="card">
                <div class="card-title">Berdasarkan Metode Pembayaran</div>
                <div class="card-row">
                    <span class="card-label">Transfer Bank</span>
                    <span class="card-value">${Helpers.rupiah(totalTransfer)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Tunai di Sekolah</span>
                    <span class="card-value">${Helpers.rupiah(totalTunai)}</span>
                </div>
            </div>

            ${
              Object.keys(perKelas).length > 0
                ? `
            <div class="card">
                <div class="card-title">Berdasarkan Kelas</div>
                ${kelasRows}
            </div>`
                : ""
            }

            <div id="daftar-belum-bayar">
                <div class="section-title">Siswa Belum Membayar</div>
                <div id="daftar-belum-list"><div class="loading">Memuat...</div></div>
            </div>
        `;

    // Load daftar siswa belum bayar
    await loadSiswaBelumBayar(periode);
  } catch (err) {
    console.error(err);
    Helpers.errorState(
      "laporan-content",
      "Gagal memuat laporan: " + err.message,
    );
  }
}

async function loadSiswaBelumBayar(periode) {
  try {
    let query = db
      .collection("tagihan")
      .where("status", "in", ["belum", "revisi", "ditolak"]);
    if (periode) query = query.where("periode", "==", periode);
    const snap = await query.orderBy("namaSiswa").get();

    const container = document.getElementById("daftar-belum-list");
    if (!container) return;

    if (snap.empty) {
      container.innerHTML =
        `<p class="text-sm text-secondary" style="padding:8px;display:flex;align-items:center;gap:6px">${Icons.checkCircle} Semua siswa sudah membayar</p>`;
      return;
    }

    container.innerHTML = snap.docs
      .map((d) => {
        const t = d.data();
        return `
                <div class="list-item">
                    <div class="list-item-left">
                        <div class="list-item-title">${t.namaSiswa || "-"}</div>
                        <div class="list-item-subtitle">${t.kelas || "-"} &middot; <span class="badge" style="background:#eff6ff;color:var(--primary);font-size:10.5px;padding:1px 6px;font-weight:700;border:1px solid #bfdbfe">${t.jenisTagihan || "SPP"}</span> &middot; ${Helpers.periodeLabel(t.periode)}</div>
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
  }
}

/* ============================================================
   Export Excel Menggunakan SheetJS
   ============================================================ */

async function exportLaporanPembayaranExcel() {
  if (typeof XLSX === "undefined") {
    Router.toast("Library SheetJS belum termuat. Silakan periksa koneksi internet.");
    return;
  }

  const periode = document.getElementById("filter-periode-laporan").value;
  Router.toast("Menyiapkan data laporan pembayaran...");

  try {
    let q = db.collection("transaksi");
    if (periode) q = q.where("periode", "==", periode);
    const snap = await q.get();

    if (snap.empty) {
      Router.toast("Tidak ada data transaksi untuk diexport pada periode ini");
      return;
    }

    const rows = snap.docs.map((doc) => {
      const t = doc.data();
      let tglBayar = "-";
      if (t.tanggal) {
        tglBayar = t.tanggal;
      } else if (t.createdAt) {
        tglBayar = Helpers.tanggal(t.createdAt);
      }
      return {
        "Nama Siswa": t.namaSiswa || "-",
        "NIS": t.nis || "-",
        "Kelas": t.kelas || "-",
        "Jenis Tagihan": t.jenisTagihan || "SPP",
        "Periode": t.periode || "-",
        "Nominal": t.nominal || 0,
        "Metode": t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank",
        "Status": (t.status || "").toUpperCase(),
        "Tanggal Bayar": tglBayar,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Nama Siswa",
        "NIS",
        "Kelas",
        "Jenis Tagihan",
        "Periode",
        "Nominal",
        "Metode",
        "Status",
        "Tanggal Bayar",
      ],
    });

    ws["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 10 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
      { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pembayaran");
    const fileName = `laporan-pembayaran-${periode || "semua"}.xlsx`;
    XLSX.writeFile(wb, fileName);
    Router.toast(`File berhasil diunduh: ${fileName}`);
  } catch (err) {
    console.error("Export Laporan error:", err);
    Router.toast("Gagal export laporan: " + err.message);
  }
}

async function exportDaftarTunggakanExcel() {
  if (typeof XLSX === "undefined") {
    Router.toast("Library SheetJS belum termuat. Silakan periksa koneksi internet.");
    return;
  }

  const periode = document.getElementById("filter-periode-laporan").value;
  Router.toast("Menyiapkan data tunggakan...");

  try {
    let q = db
      .collection("tagihan")
      .where("status", "in", ["belum", "revisi", "ditolak"]);
    if (periode) q = q.where("periode", "==", periode);
    const snap = await q.get();

    if (snap.empty) {
      Router.toast("Tidak ada tagihan tertunggak pada periode ini");
      return;
    }

    const rows = snap.docs.map((doc) => {
      const t = doc.data();
      return {
        "Nama Siswa": t.namaSiswa || "-",
        "NIS": t.nis || "-",
        "Kelas": t.kelas || "-",
        "Jenis Tagihan": t.jenisTagihan || "SPP",
        "Periode": t.periode || "-",
        "Nominal": t.nominal || 0,
        "Jatuh Tempo": t.jatuhTempo || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Nama Siswa",
        "NIS",
        "Kelas",
        "Jenis Tagihan",
        "Periode",
        "Nominal",
        "Jatuh Tempo",
      ],
    });

    ws["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 10 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tunggakan");
    const fileName = `tunggakan-${periode || "semua"}.xlsx`;
    XLSX.writeFile(wb, fileName);
    Router.toast(`File berhasil diunduh: ${fileName}`);
  } catch (err) {
    console.error("Export Tunggakan error:", err);
    Router.toast("Gagal export tunggakan: " + err.message);
  }
}
