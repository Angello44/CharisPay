/* ============================================================
   Dashboard Admin (Modern & Professional UI)
   ============================================================ */

Router.register("dashboard-admin", {
  title: "Dashboard Admin",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "Auth.logout()",
  actionIcon: Icons.logout,

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Petugas Keuangan";
    return `
      <div class="profile-header">
        <div class="profile-avatar">${nama.charAt(0).toUpperCase()}</div>
        <div class="profile-name">${nama}</div>
        <div class="profile-email">Bagian Keuangan Charis Institute</div>
      </div>

      <div class="summary-grid" id="summary-admin">
        <div class="summary-card primary" onclick="Router.go('data-siswa')" style="cursor:pointer"><div class="summary-number">-</div><div class="summary-label">Total Siswa</div></div>
        <div class="summary-card warning" onclick="Router.go('tagihan-admin')" style="cursor:pointer"><div class="summary-number">-</div><div class="summary-label">Belum Bayar</div></div>
        <div class="summary-card info" onclick="Router.go('verifikasi')" style="cursor:pointer"><div class="summary-number">-</div><div class="summary-label">Perlu Verifikasi</div></div>
        <div class="summary-card success" onclick="Router.go('laporan')" style="cursor:pointer"><div class="summary-number">-</div><div class="summary-label">Lunas</div></div>
      </div>

      <div class="section-title">Menu Utama Admin</div>

      <div class="list-item" onclick="Router.go('data-siswa')">
        <div class="list-item-left">
          <div class="icon-circle qa-blue">${Icons.students}</div>
          <div class="list-item-content">
            <div class="list-item-title">Data Siswa</div>
            <div class="list-item-subtitle">Kelola NIS, kelas, dan data orang tua</div>
          </div>
        </div>
        <span class="list-item-chevron">${Icons.chevronRight}</span>
      </div>

      <div class="list-item" onclick="Router.go('tagihan-admin')">
        <div class="list-item-left">
          <div class="icon-circle qa-indigo">${Icons.receipt}</div>
          <div class="list-item-content">
            <div class="list-item-title">Kelola Tagihan SPP</div>
            <div class="list-item-subtitle">Buat tagihan baru & catat pembayaran tunai</div>
          </div>
        </div>
        <span class="list-item-chevron">${Icons.chevronRight}</span>
      </div>

      <div class="list-item" onclick="Router.go('verifikasi')">
        <div class="list-item-left">
          <div class="icon-circle qa-emerald">${Icons.verified}</div>
          <div class="list-item-content">
            <div class="list-item-title">Verifikasi Pembayaran</div>
            <div class="list-item-subtitle" id="info-verifikasi">Memeriksa bukti transfer...</div>
          </div>
        </div>
        <span id="badge-verifikasi"><span class="list-item-chevron">${Icons.chevronRight}</span></span>
      </div>

      <div class="list-item" onclick="Router.go('laporan')">
        <div class="list-item-left">
          <div class="icon-circle qa-amber">${Icons.report}</div>
          <div class="list-item-content">
            <div class="list-item-title">Laporan Keuangan</div>
            <div class="list-item-subtitle">Rekapitulasi pemasukan SPP sekolah</div>
          </div>
        </div>
        <span class="list-item-chevron">${Icons.chevronRight}</span>
      </div>

      <div class="list-item" onclick="Router.go('wali-kelas')">
        <div class="list-item-left">
          <div class="icon-circle qa-cyan">${Icons.teacher}</div>
          <div class="list-item-content">
            <div class="list-item-title">Data Wali Kelas</div>
            <div class="list-item-subtitle">Atur wali kelas dan kontak per kelas</div>
          </div>
        </div>
        <span class="list-item-chevron">${Icons.chevronRight}</span>
      </div>

      <div class="list-item" onclick="Router.go('nilai-admin')">
        <div class="list-item-left">
          <div class="icon-circle qa-purple">${Icons.grade}</div>
          <div class="list-item-content">
            <div class="list-item-title">Input Nilai Siswa</div>
            <div class="list-item-subtitle">Kelola nilai rata-rata akhir kenaikan kelas</div>
          </div>
        </div>
        <span class="list-item-chevron">${Icons.chevronRight}</span>
      </div>
    `;
  },

  async init() {
    await loadDashboardAdmin();
  },
});

async function loadDashboardAdmin() {
  try {
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

    const summaryEl = document.getElementById("summary-admin");
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-card primary" onclick="Router.go('data-siswa')" style="cursor:pointer"><div class="summary-number">${totalSiswa}</div><div class="summary-label">Total Siswa</div></div>
        <div class="summary-card warning" onclick="Router.go('tagihan-admin')" style="cursor:pointer"><div class="summary-number">${belumBayar}</div><div class="summary-label">Belum Bayar</div></div>
        <div class="summary-card info" onclick="Router.go('verifikasi')" style="cursor:pointer"><div class="summary-number">${menunggu}</div><div class="summary-label">Perlu Verifikasi</div></div>
        <div class="summary-card success" onclick="Router.go('laporan')" style="cursor:pointer"><div class="summary-number">${lunas}</div><div class="summary-label">Lunas</div></div>
      `;
    }

    const infoVerif = document.getElementById("info-verifikasi");
    const badgeVerif = document.getElementById("badge-verifikasi");
    if (infoVerif) {
      if (menunggu > 0) {
        infoVerif.textContent = `${menunggu} transfer menunggu persetujuan`;
        if (badgeVerif)
          badgeVerif.innerHTML = `<span class="badge badge-menunggu">${menunggu}</span>`;
      } else {
        infoVerif.textContent = "Semua transaksi terverifikasi";
        if (badgeVerif)
          badgeVerif.innerHTML = `<span class="list-item-chevron">${Icons.chevronRight}</span>`;
      }
    }
  } catch (err) {
    console.error("Dashboard admin error:", err);
  }
}
