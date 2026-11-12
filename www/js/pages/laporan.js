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
            <div class="form-group flex gap-8">
                <input type="month" id="filter-periode-laporan"
                       style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
                <button class="btn btn-primary btn-sm" onclick="loadLaporan()">Filter</button>
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
        '<p class="text-sm text-secondary" style="padding:8px">Semua siswa sudah membayar 🎉</p>';
      return;
    }

    container.innerHTML = snap.docs
      .map((d) => {
        const t = d.data();
        return `
                <div class="list-item">
                    <div class="list-item-left">
                        <div class="list-item-title">${t.namaSiswa || "-"}</div>
                        <div class="list-item-subtitle">${t.kelas || "-"} &middot; SPP ${Helpers.periodeLabel(t.periode)}</div>
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
