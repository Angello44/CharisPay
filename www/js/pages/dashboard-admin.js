/* ============================================================
   Dashboard Admin
   ============================================================ */

Router.register("dashboard-admin", {
  title: "Dashboard Admin",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "Auth.logout()",
  actionIcon: "⏻",

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Admin";
    return `
            <div class="profile-header">
                <div class="profile-avatar">A</div>
                <div class="profile-name">${nama}</div>
                <div class="profile-email">Petugas Keuangan</div>
            </div>

            <div class="summary-grid" id="summary-admin">
                <div class="summary-card primary"><div class="summary-number">-</div><div class="summary-label">Total Siswa</div></div>
                <div class="summary-card warning"><div class="summary-number">-</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">-</div><div class="summary-label">Perlu Verifikasi</div></div>
                <div class="summary-card success"><div class="summary-number">-</div><div class="summary-label">Lunas</div></div>
            </div>

            <div class="section-title">Aksi Cepat</div>

            <div class="list-item" onclick="Router.go('data-siswa')">
                <div class="list-item-left">
                    <div class="list-item-title">👨‍🎓 Kelola Data Siswa</div>
                    <div class="list-item-subtitle">Tambah, edit, lihat data siswa</div>
                </div>
                <span class="text-secondary">›</span>
            </div>

            <div class="list-item" onclick="Router.go('tagihan-admin')">
                <div class="list-item-left">
                    <div class="list-item-title">📄 Kelola Tagihan SPP</div>
                    <div class="list-item-subtitle">Buat tagihan dan catat pembayaran tunai</div>
                </div>
                <span class="text-secondary">›</span>
            </div>

            <div class="list-item" onclick="Router.go('verifikasi')">
                <div class="list-item-left">
                    <div class="list-item-title">✅ Verifikasi Pembayaran</div>
                    <div class="list-item-subtitle" id="info-verifikasi">Memuat...</div>
                </div>
                <span id="badge-verifikasi"></span>
            </div>

            <div class="list-item" onclick="Router.go('laporan')">
                <div class="list-item-left">
                    <div class="list-item-title">📊 Laporan Pembayaran</div>
                    <div class="list-item-subtitle">Ringkasan & rekap pembayaran SPP</div>
                </div>
                <span class="text-secondary">›</span>
            </div>
        `;
  },

  async init() {
    await loadDashboardAdmin();
  },
});

async function loadDashboardAdmin() {
  try {
    // Ambil semua data sekaligus
    const [siswaSnap, tagihanSnap, transaksiSnap] = await Promise.all([
      db.collection("siswa").get(),
      db.collection("tagihan").get(),
      db.collection("transaksi").where("status", "==", "menunggu").get(),
    ]);

    const totalSiswa = siswaSnap.size;
    const menunggu = transaksiSnap.size;

    let belumBayar = 0,
      lunas = 0;
    tagihanSnap.docs.forEach((d) => {
      const s = d.data().status;
      if (s === "belum" || s === "revisi" || s === "ditolak") belumBayar++;
      if (s === "lunas") lunas++;
    });

    // Update summary
    const summaryEl = document.getElementById("summary-admin");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card primary"><div class="summary-number">${totalSiswa}</div><div class="summary-label">Total Siswa</div></div>
                <div class="summary-card warning"><div class="summary-number">${belumBayar}</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">${menunggu}</div><div class="summary-label">Perlu Verifikasi</div></div>
                <div class="summary-card success"><div class="summary-number">${lunas}</div><div class="summary-label">Lunas</div></div>
            `;
    }

    // Update info verifikasi
    const infoVerif = document.getElementById("info-verifikasi");
    const badgeVerif = document.getElementById("badge-verifikasi");
    if (infoVerif) {
      if (menunggu > 0) {
        infoVerif.textContent = `${menunggu} bukti transfer menunggu konfirmasi`;
        if (badgeVerif)
          badgeVerif.innerHTML = `<span class="badge badge-menunggu">${menunggu}</span>`;
      } else {
        infoVerif.textContent = "Semua sudah terverifikasi";
        if (badgeVerif)
          badgeVerif.innerHTML = '<span class="text-secondary">›</span>';
      }
    }
  } catch (err) {
    console.error("Dashboard admin error:", err);
  }
}
