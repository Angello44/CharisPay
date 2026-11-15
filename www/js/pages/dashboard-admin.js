/* ============================================================
   Dashboard Admin (Executive Laptop & Desktop Layout)
   ============================================================ */

Router.register("dashboard-admin", {
  title: "Dashboard",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "Auth.logout()",
  actionIcon: Icons.logout,

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Petugas Keuangan";
    const tglSekarang = formatTanggalIndo(new Date());

    return `
      <!-- 1. Hero Welcome & Quick Action Header -->
      <div class="admin-dashboard-hero">
        <div class="hero-text">
          <div class="hero-date">${tglSekarang}</div>
          <h1 class="hero-title">Selamat Datang, ${nama}</h1>
          <p class="hero-subtitle">Berikut ringkasan operasional keuangan dan tagihan SPP Charis Institute hari ini.</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="Router.go('tagihan-admin')">
            ${Icons.receipt} Buat Tagihan SPP
          </button>
          <button class="btn btn-secondary" onclick="Router.go('data-siswa')">
            ${Icons.students} Tambah Siswa
          </button>
        </div>
      </div>

      <!-- 2. KPI Statistik Utama (4 Kartu Sejajar di Laptop) -->
      <div class="kpi-grid" id="summary-admin">
        <div class="kpi-card kpi-blue" onclick="Router.go('data-siswa')">
          <div class="kpi-card-top">
            <div class="kpi-icon-wrap">${Icons.students}</div>
            <span class="kpi-tag">Data Siswa</span>
          </div>
          <div class="kpi-value" id="kpi-total-siswa">-</div>
          <div class="kpi-label">Total Siswa Aktif</div>
          <div class="kpi-desc">TK, SD, dan SMP</div>
        </div>

        <div class="kpi-card kpi-amber" onclick="Router.go('verifikasi')">
          <div class="kpi-card-top">
            <div class="kpi-icon-wrap">${Icons.verified}</div>
            <span class="kpi-tag" id="kpi-tag-verif">Penting</span>
          </div>
          <div class="kpi-value" id="kpi-menunggu">-</div>
          <div class="kpi-label">Perlu Verifikasi</div>
          <div class="kpi-desc" id="kpi-desc-verif">Bukti transfer masuk</div>
        </div>

        <div class="kpi-card kpi-rose" onclick="Router.go('tagihan-admin')">
          <div class="kpi-card-top">
            <div class="kpi-icon-wrap">${Icons.wallet}</div>
            <span class="kpi-tag">Tunggakan</span>
          </div>
          <div class="kpi-value" id="kpi-belum-bayar">-</div>
          <div class="kpi-label">Tagihan Belum Lunas</div>
          <div class="kpi-desc">Menunggu pembayaran</div>
        </div>

        <div class="kpi-card kpi-emerald" onclick="Router.go('laporan')">
          <div class="kpi-card-top">
            <div class="kpi-icon-wrap">${Icons.checkCircle}</div>
            <span class="kpi-tag">Terkumpul</span>
          </div>
          <div class="kpi-value" id="kpi-lunas">-</div>
          <div class="kpi-label">Tagihan Lunas</div>
          <div class="kpi-desc" id="kpi-total-nominal">Total pelunasan SPP</div>
        </div>
      </div>

      <!-- 3. Main Dashboard Desktop Layout (2 Kolom Lebar) -->
      <div class="admin-dashboard-grid">
        <!-- Kolom Kiri: Antrean Verifikasi & Rekap Penerimaan per Jenjang -->
        <div class="dashboard-col-left">
          <!-- Antrean Verifikasi Pembayaran -->
          <div class="desktop-panel">
            <div class="desktop-panel-header">
              <div>
                <h2 class="desktop-panel-title">Antrean Verifikasi Pembayaran</h2>
                <p class="desktop-panel-subtitle">Bukti transfer terbaru yang diunggah orang tua dan membutuhkan konfirmasi</p>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Router.go('verifikasi')">
                Lihat Semua ${Icons.chevronRight}
              </button>
            </div>
            <div id="dashboard-verif-queue">
              <div class="loading">Memeriksa antrean pembayaran...</div>
            </div>
          </div>

          <!-- Penerimaan SPP per Jenjang (TK, SD, SMP) -->
          <div class="desktop-panel" style="margin-top:20px">
            <div class="desktop-panel-header">
              <div>
                <h2 class="desktop-panel-title">Penerimaan SPP per Jenjang</h2>
                <p class="desktop-panel-subtitle">Persentase kelunasan tagihan siswa sekolah</p>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Router.go('laporan')">
                Buka Laporan ${Icons.chevronRight}
              </button>
            </div>
            <div id="dashboard-jenjang-stats">
              <div class="loading">Memuat ringkasan jenjang...</div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Akses Modul Cepat & Info Rekening Sekolah -->
        <div class="dashboard-col-right">
          <!-- Akses Modul Cepat -->
          <div class="desktop-panel">
            <div class="desktop-panel-header">
              <div>
                <h2 class="desktop-panel-title">Akses Modul Cepat</h2>
                <p class="desktop-panel-subtitle">Fitur administrasi sekolah</p>
              </div>
            </div>
            <div class="desktop-shortcut-grid">
              <div class="desktop-shortcut-card" onclick="Router.go('data-siswa')">
                <div class="shortcut-icon-box qa-blue">${Icons.students}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Kelola Data Siswa</div>
                  <div class="shortcut-desc">NIS, kelas, dan akun ortu</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>

              <div class="desktop-shortcut-card" onclick="Router.go('tagihan-admin')">
                <div class="shortcut-icon-box qa-indigo">${Icons.receipt}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Kelola Tagihan SPP</div>
                  <div class="shortcut-desc">Buat tagihan massal & kasir tunai</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>

              <div class="desktop-shortcut-card" onclick="Router.go('verifikasi')">
                <div class="shortcut-icon-box qa-emerald">${Icons.verified}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Verifikasi Pembayaran</div>
                  <div class="shortcut-desc">Pemeriksaan bukti transfer</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>

              <div class="desktop-shortcut-card" onclick="Router.go('laporan')">
                <div class="shortcut-icon-box qa-amber">${Icons.report}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Laporan Keuangan</div>
                  <div class="shortcut-desc">Rekap pemasukan SPP sekolah</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>

              <div class="desktop-shortcut-card" onclick="Router.go('wali-kelas')">
                <div class="shortcut-icon-box qa-cyan">${Icons.teacher}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Data Wali Kelas</div>
                  <div class="shortcut-desc">Kontak guru dan wali kelas</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>

              <div class="desktop-shortcut-card" onclick="Router.go('nilai-admin')">
                <div class="shortcut-icon-box qa-purple">${Icons.grade}</div>
                <div class="shortcut-info">
                  <div class="shortcut-title">Input Nilai Rapor</div>
                  <div class="shortcut-desc">Nilai akhir kenaikan kelas</div>
                </div>
                <span class="shortcut-arrow">${Icons.chevronRight}</span>
              </div>
            </div>
          </div>

          <!-- Info Rekening Kasir & Standar Operasional -->
          <div class="desktop-panel" style="margin-top:20px;background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%);color:white;border:none">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div style="width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:#60a5fa">
                ${Icons.wallet}
              </div>
              <div>
                <div style="font-weight:700;font-size:14.5px;color:white">Rekening Resmi Sekolah</div>
                <div style="font-size:12px;color:#94a3b8">BCA Charis Institute</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;margin-bottom:12px">
              <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Nomor Rekening BCA</div>
              <div style="font-size:17px;font-weight:800;letter-spacing:1px;color:#38bdf8;margin:2px 0">123-456-7890</div>
              <div style="font-size:12px;color:#cbd5e1">a.n. Yayasan Charis Institute</div>
            </div>
            <div style="font-size:12px;color:#94a3b8;line-height:1.5">
              Setiap verifikasi pembayaran transfer langsung memutakhirkan status tagihan dan kwitansi pada aplikasi orang tua secara real-time.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    await loadDashboardAdmin();
  },
});

function formatTanggalIndo(date) {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

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
      lunas = 0,
      totalNominalLunas = 0;

    tagihanSnap.docs.forEach((d) => {
      const s = d.data();
      if (s.status === "belum" || s.status === "revisi" || s.status === "ditolak") belumBayar++;
      if (s.status === "lunas") {
        lunas++;
        totalNominalLunas += s.nominal || 0;
      }
    });

    // Update KPI Card values
    const kpiSiswa = document.getElementById("kpi-total-siswa");
    if (kpiSiswa) kpiSiswa.textContent = totalSiswa;

    const kpiMenunggu = document.getElementById("kpi-menunggu");
    if (kpiMenunggu) kpiMenunggu.textContent = menunggu;

    const kpiTagVerif = document.getElementById("kpi-tag-verif");
    const kpiDescVerif = document.getElementById("kpi-desc-verif");
    if (kpiTagVerif && kpiDescVerif) {
      if (menunggu > 0) {
        kpiTagVerif.textContent = `${menunggu} Antrean`;
        kpiTagVerif.style.background = "#fee2e2";
        kpiTagVerif.style.color = "#dc2626";
        kpiDescVerif.textContent = "Segera periksa bukti transfer";
      } else {
        kpiTagVerif.textContent = "Semua Beres";
        kpiTagVerif.style.background = "#ecfdf5";
        kpiTagVerif.style.color = "#059669";
        kpiDescVerif.textContent = "Tidak ada antrean tertunda";
      }
    }

    const kpiBelum = document.getElementById("kpi-belum-bayar");
    if (kpiBelum) kpiBelum.textContent = belumBayar;

    const kpiLunas = document.getElementById("kpi-lunas");
    if (kpiLunas) kpiLunas.textContent = lunas;

    const kpiNominal = document.getElementById("kpi-total-nominal");
    if (kpiNominal && totalNominalLunas > 0) {
      kpiNominal.textContent = `Terkumpul ${Helpers.rupiah(totalNominalLunas)}`;
    }

    // Render Antrean Verifikasi
    renderVerifQueue(transaksiSnap.docs);

    // Render Statistik Jenjang
    renderJenjangStats(tagihanSnap.docs);
  } catch (err) {
    console.error("Dashboard admin error:", err);
  }
}

function renderVerifQueue(docs) {
  const container = document.getElementById("dashboard-verif-queue");
  if (!container) return;

  if (docs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px;background:#f8fafc;border:1px dashed var(--border);border-radius:12px">
        <div style="width:48px;height:48px;border-radius:50%;background:#ecfdf5;color:#10b981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px">
          ${Icons.checkCircle}
        </div>
        <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:4px">
          Semua Pembayaran Telah Terverifikasi
        </div>
        <div style="font-size:12.5px;color:var(--text-secondary)">
          Saat ini tidak ada berkas transfer orang tua yang menunggu persetujuan.
        </div>
      </div>
    `;
    return;
  }

  // Tampilkan maksimal 5 transaksi terbaru
  const list = docs.slice(0, 5);
  let rowsHtml = "";

  list.forEach((doc) => {
    const t = { id: doc.id, ...doc.data() };
    const tanggal = t.createdAt ? Helpers.formatTanggal(t.createdAt.toDate()) : "-";

    rowsHtml += `
      <tr class="queue-row" onclick="Router.go('verifikasi')" style="cursor:pointer">
        <td>
          <div style="font-weight:700;color:var(--text);font-size:13.5px">${t.namaSiswa || "-"}</div>
          <div style="font-size:11.5px;color:var(--text-secondary)">NIS: ${t.nis || "-"} &bull; Kelas: ${t.kelas || "-"}</div>
        </td>
        <td>
          <span class="badge-soft badge-soft-primary" style="font-size:11.5px">${Helpers.periodeLabel(t.periode || "")}</span>
        </td>
        <td style="font-weight:700;color:var(--primary);font-size:13.5px">
          ${Helpers.rupiah(t.nominal || 0)}
        </td>
        <td style="font-size:12px;color:var(--text-secondary)">
          ${tanggal}
        </td>
        <td style="text-align:right">
          <button class="btn btn-primary btn-xs" onclick="event.stopPropagation(); Router.go('verifikasi')">
            Periksa Bukti
          </button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="desktop-table">
        <thead>
          <tr>
            <th>Siswa</th>
            <th>Periode</th>
            <th>Nominal</th>
            <th>Waktu Masuk</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function renderJenjangStats(tagihanDocs) {
  const container = document.getElementById("dashboard-jenjang-stats");
  if (!container) return;

  const stats = {
    TK: { total: 0, lunas: 0, nominal: 0 },
    SD: { total: 0, lunas: 0, nominal: 0 },
    SMP: { total: 0, lunas: 0, nominal: 0 },
  };

  tagihanDocs.forEach((d) => {
    const t = d.data();
    const kelas = (t.kelas || "").toUpperCase();
    let kategori = "SD";
    if (kelas.includes("TK") || kelas.includes("KB")) kategori = "TK";
    else if (kelas.includes("SMP") || kelas.includes("7") || kelas.includes("8") || kelas.includes("9"))
      kategori = "SMP";

    stats[kategori].total++;
    stats[kategori].nominal += t.nominal || 0;
    if (t.status === "lunas") stats[kategori].lunas++;
  });

  const cardsHtml = Object.entries(stats)
    .map(([jenjang, data]) => {
      const pct = data.total > 0 ? Math.round((data.lunas / data.total) * 100) : 0;
      const color = jenjang === "TK" ? "#3b82f6" : jenjang === "SD" ? "#10b981" : "#8b5cf6";

      return `
        <div class="jenjang-card">
          <div class="jenjang-card-header">
            <div style="font-weight:800;font-size:14px;color:var(--text)">Jenjang ${jenjang}</div>
            <div style="font-weight:700;font-size:12.5px;color:${color}">${pct}% Lunas</div>
          </div>
          <div class="jenjang-progress-bg">
            <div class="jenjang-progress-bar" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="jenjang-card-footer">
            <span>${data.lunas} / ${data.total} tagihan</span>
            <span style="font-weight:600">${Helpers.rupiah(data.nominal)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `<div class="jenjang-grid">${cardsHtml}</div>`;
}
