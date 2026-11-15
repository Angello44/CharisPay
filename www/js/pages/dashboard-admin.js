/* ============================================================
   Dashboard Admin (Modern Executive Desktop Layout)
   Desain terinspirasi dari referensi dashboard SaaS profesional
   dengan bilah samping (sidebar) permanen di laptop/desktop.
   ============================================================ */

Router.register("dashboard-admin", {
  title: "Dashboard",
  nav: true,
  requireAuth: true,
  role: "admin",
  action: "Router.go('profil')",
  actionIcon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Petugas Keuangan";

    return `
      <div class="dash-container">
        <!-- BARIS UTAMA ATAS: Kolom Konten (Kiri) & Kolom Widget (Kanan) -->
        <div class="dash-main-layout">
          
          <!-- ==================== KOLOM KIRI (UTAMA) ==================== -->
          <div class="dash-content-area">
            
            <!-- 1. Header Baris Atas: Feature Card Ungu + 3 Kartu Metrik -->
            <div class="dash-top-metrics">
              
              <!-- Large Highlight Feature Card (Mirip Referensi Kartu Ungu) -->
              <div class="dash-feature-card">
                <div class="feature-card-header">
                  <div class="feature-icon-circle">
                    ${Icons.receipt}
                  </div>
                  <span class="feature-badge">Terkumpul Kas</span>
                </div>
                <div class="feature-value" id="kpi-total-nominal">Rp 0</div>
                <div class="feature-title">Total SPP Lunas Terverifikasi</div>
                <p class="feature-desc">Akumulasi seluruh pembayaran SPP siswa yang telah disetujui petugas dan masuk kas sekolah.</p>
                <div class="feature-glow-shape"></div>
              </div>

              <!-- 3 Kartu Metrik Sejajar / Vertikal -->
              <div class="dash-kpi-stack">
                <!-- KPI 1: Total Siswa -->
                <div class="dash-kpi-card" onclick="Router.go('data-siswa')" style="cursor:pointer">
                  <div class="kpi-left-icon kpi-bg-blue">${Icons.students}</div>
                  <div class="kpi-text-meta">
                    <div class="kpi-num" id="kpi-total-siswa">-</div>
                    <div class="kpi-label">Total Siswa Aktif</div>
                    <div class="kpi-sub">TK, SD, dan SMP</div>
                  </div>
                  <span class="kpi-arrow">${Icons.chevronRight}</span>
                </div>

                <!-- KPI 2: Perlu Verifikasi -->
                <div class="dash-kpi-card" onclick="Router.go('verifikasi')" style="cursor:pointer">
                  <div class="kpi-left-icon kpi-bg-amber">${Icons.verified}</div>
                  <div class="kpi-text-meta">
                    <div class="kpi-num" id="kpi-menunggu">-</div>
                    <div class="kpi-label">Perlu Verifikasi</div>
                    <div class="kpi-sub" id="kpi-desc-verif">Bukti transfer masuk</div>
                  </div>
                  <span class="kpi-badge-alert" id="kpi-alert-badge" style="display:none">0</span>
                </div>

                <!-- KPI 3: Belum Bayar -->
                <div class="dash-kpi-card" onclick="Router.go('tagihan-admin')" style="cursor:pointer">
                  <div class="kpi-left-icon kpi-bg-rose">${Icons.warning}</div>
                  <div class="kpi-text-meta">
                    <div class="kpi-num" id="kpi-belum-bayar">-</div>
                    <div class="kpi-label">Tagihan Belum Lunas</div>
                    <div class="kpi-sub">Menunggu pembayaran</div>
                  </div>
                  <span class="kpi-arrow">${Icons.chevronRight}</span>
                </div>
              </div>

            </div>

            <!-- 2. Bar Chart Statistik Penerimaan SPP per Jenjang (Mirip Referensi Bar Chart) -->
            <div class="dash-card-panel mt-20">
              <div class="dash-panel-header">
                <div>
                  <h2 class="dash-panel-title">Statistik Penerimaan SPP per Jenjang</h2>
                  <p class="dash-panel-subtitle">Perbandingan rasio kelunasan tagihan siswa sekolah (TK, SD, dan SMP)</p>
                </div>
                <div class="chart-legend-group">
                  <span class="chart-legend-pill"><span class="legend-dot dot-tk"></span>TK / KB</span>
                  <span class="chart-legend-pill"><span class="legend-dot dot-sd"></span>SD</span>
                  <span class="chart-legend-pill"><span class="legend-dot dot-smp"></span>SMP</span>
                </div>
              </div>
              <div id="dashboard-bar-chart">
                <div class="loading">Memuat visualisasi statistik...</div>
              </div>
            </div>

            <!-- 3. Tabel Data: Antrean Verifikasi Bukti Pembayaran (Mirip Referensi Data Table) -->
            <div class="dash-card-panel mt-20">
              <div class="dash-panel-header">
                <div>
                  <h2 class="dash-panel-title">Antrean Pembayaran Terbaru</h2>
                  <p class="dash-panel-subtitle">Bukti transfer dari orang tua siswa yang membutuhkan persetujuan petugas</p>
                </div>
                <button class="btn btn-outline btn-sm" onclick="Router.go('verifikasi')">
                  Buka Verifikasi ${Icons.chevronRight}
                </button>
              </div>
              <div id="dashboard-verif-queue">
                <div class="loading">Memeriksa antrean pembayaran...</div>
              </div>
            </div>

          </div>

          <!-- ==================== KOLOM KANAN (WIDGET & KALENDER) ==================== -->
          <div class="dash-sidebar-widgets">
            
            <!-- Widget 1: Kalender Mini Interaktif (Sesuai Gambar Referensi) -->
            <div class="dash-card-panel">
              <div id="dashboard-mini-calendar">
                ${renderMiniCalendar()}
              </div>
            </div>

            <!-- Widget 2: Akses Cepat Modul Admin -->
            <div class="dash-card-panel mt-20">
              <div class="dash-panel-header mb-12">
                <h3 class="dash-panel-title text-sm">Pintasan Cepat</h3>
              </div>
              <div class="quick-links-list">
                <div class="quick-link-item" onclick="Router.go('tagihan-admin')">
                  <div class="quick-link-icon">${Icons.receipt}</div>
                  <div class="quick-link-info">
                    <div class="quick-link-title">Buat Tagihan SPP</div>
                    <div class="quick-link-desc">Tagihan massal / per jenjang</div>
                  </div>
                  <span class="quick-link-arrow">${Icons.chevronRight}</span>
                </div>

                <div class="quick-link-item" onclick="Router.go('data-siswa')">
                  <div class="quick-link-icon">${Icons.students}</div>
                  <div class="quick-link-info">
                    <div class="quick-link-title">Tambah Siswa Baru</div>
                    <div class="quick-link-desc">Registrasi & hubungkan akun ortu</div>
                  </div>
                  <span class="quick-link-arrow">${Icons.chevronRight}</span>
                </div>

                <div class="quick-link-item" onclick="Router.go('wali-kelas')">
                  <div class="quick-link-icon">${Icons.teacher}</div>
                  <div class="quick-link-info">
                    <div class="quick-link-title">Data Wali Kelas</div>
                    <div class="quick-link-desc">Atur nomor WhatsApp wali kelas</div>
                  </div>
                  <span class="quick-link-arrow">${Icons.chevronRight}</span>
                </div>

                <div class="quick-link-item" onclick="Router.go('nilai-admin')">
                  <div class="quick-link-icon">${Icons.grade}</div>
                  <div class="quick-link-info">
                    <div class="quick-link-title">Input Nilai Rapor</div>
                    <div class="quick-link-desc">Nilai akhir kenaikan kelas</div>
                  </div>
                  <span class="quick-link-arrow">${Icons.chevronRight}</span>
                </div>

                <div class="quick-link-item" onclick="Router.go('profil')">
                  <div class="quick-link-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <div class="quick-link-info">
                    <div class="quick-link-title">Edit Profil</div>
                    <div class="quick-link-desc">Nama, HP, email, password</div>
                  </div>
                  <span class="quick-link-arrow">${Icons.chevronRight}</span>
                </div>
              </div>
            </div>

            <!-- Widget 3: Rekening Resmi Kasir Sekolah -->
            <div class="dash-card-panel mt-20 bank-card-dark">
              <div class="bank-card-head">
                <div class="bank-icon-wrap">${Icons.wallet}</div>
                <div>
                  <div class="bank-title">Rekening Kasir Sekolah</div>
                  <div class="bank-sub">Bank Central Asia (BCA)</div>
                </div>
              </div>
              <div class="bank-number-box">
                <div class="bank-num-label">Nomor Rekening Resmi</div>
                <div class="bank-num-val">123-456-7890</div>
                <div class="bank-holder">a.n. Yayasan Charis Institute</div>
              </div>
              <p class="bank-note">
                Gunakan acuan nomor rekening di atas saat memvalidasi keaslian struk transfer orang tua.
              </p>
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

/* ---------- Generator Kalender Mini (Bulan Ini) ---------- */

function renderMiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthNames = [
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

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let daysHtml = "";
  for (let i = 0; i < firstDay; i++) {
    daysHtml += `<div class="cal-cell empty"></div>`;
  }
  for (let d = 1; d <= totalDays; d++) {
    const isToday = d === today ? "is-today" : "";
    daysHtml += `<div class="cal-cell ${isToday}"><span>${d}</span></div>`;
  }

  return `
    <div class="cal-widget">
      <div class="cal-widget-top">
        <div class="cal-current-title">${monthNames[month]} ${year}</div>
        <div class="cal-nav-buttons">
          <span class="cal-btn-prev">${Icons.arrowLeft}</span>
          <span class="cal-btn-next">${Icons.chevronRight}</span>
        </div>
      </div>
      <div class="cal-week-labels">
        <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
      </div>
      <div class="cal-days-grid">
        ${daysHtml}
      </div>
    </div>
  `;
}

/* ---------- Data Loader Dashboard ---------- */

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
      if (
        s.status === "belum" ||
        s.status === "revisi" ||
        s.status === "ditolak"
      )
        belumBayar++;
      if (s.status === "lunas") {
        lunas++;
        totalNominalLunas += s.nominal || 0;
      }
    });

    // 1. Update KPI Values
    const kpiSiswa = document.getElementById("kpi-total-siswa");
    if (kpiSiswa) kpiSiswa.textContent = totalSiswa;

    const kpiMenunggu = document.getElementById("kpi-menunggu");
    if (kpiMenunggu) kpiMenunggu.textContent = menunggu;

    const alertBadge = document.getElementById("kpi-alert-badge");
    const descVerif = document.getElementById("kpi-desc-verif");
    if (alertBadge) {
      if (menunggu > 0) {
        alertBadge.textContent = `${menunggu} Baru`;
        alertBadge.style.display = "inline-flex";
        if (descVerif) descVerif.textContent = "Segera verifikasi berkas";
      } else {
        alertBadge.style.display = "none";
        if (descVerif) descVerif.textContent = "Semua berkas terverifikasi";
      }
    }

    const kpiBelum = document.getElementById("kpi-belum-bayar");
    if (kpiBelum) kpiBelum.textContent = belumBayar;

    const kpiNominal = document.getElementById("kpi-total-nominal");
    if (kpiNominal) {
      kpiNominal.textContent = Helpers.rupiah(totalNominalLunas);
    }

    // 2. Render Bar Chart Statistik per Jenjang
    renderBarChart(tagihanSnap.docs);

    // 3. Render Antrean Verifikasi Pembayaran
    renderVerifQueue(transaksiSnap.docs);
  } catch (err) {
    console.error("Dashboard admin error:", err);
  }
}

/* ---------- Visualisasi Bar Chart Jenjang ---------- */

function renderBarChart(tagihanDocs) {
  const container = document.getElementById("dashboard-bar-chart");
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
    else if (
      kelas.includes("SMP") ||
      kelas.includes("7") ||
      kelas.includes("8") ||
      kelas.includes("9")
    )
      kategori = "SMP";

    stats[kategori].total++;
    stats[kategori].nominal += t.nominal || 0;
    if (t.status === "lunas") stats[kategori].lunas++;
  });

  const jenjangConfigs = [
    {
      key: "TK",
      title: "Jenjang TK / KB",
      color: "#38bdf8",
      bgTrack: "#e0f2fe",
    },
    { key: "SD", title: "Jenjang SD", color: "#6366f1", bgTrack: "#eef2ff" },
    { key: "SMP", title: "Jenjang SMP", color: "#f97316", bgTrack: "#ffedd5" },
  ];

  const barsHtml = jenjangConfigs
    .map((cfg) => {
      const data = stats[cfg.key] || { total: 0, lunas: 0, nominal: 0 };
      const pct =
        data.total > 0 ? Math.round((data.lunas / data.total) * 100) : 0;
      const barHeight = Math.max(16, pct);

      return `
      <div class="chart-jenjang-item">
        <div class="chart-pct-badge" style="color:${cfg.color};background:${cfg.bgTrack}">${pct}%</div>
        <div class="chart-vertical-track" style="background:${cfg.bgTrack}">
          <div class="chart-vertical-fill" style="height:${barHeight}%;background:${cfg.color}"></div>
        </div>
        <div class="chart-jenjang-label">${cfg.key}</div>
        <div class="chart-jenjang-sub">${data.lunas}/${data.total} Lunas</div>
        <div class="chart-jenjang-nominal">${Helpers.rupiah(data.nominal)}</div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `
    <div class="chart-display-container">
      <div class="chart-bars-row">
        ${barsHtml}
      </div>
    </div>
  `;
}

/* ---------- Antrean Verifikasi Pembayaran (Tabel Desktop) ---------- */

function renderVerifQueue(docs) {
  const container = document.getElementById("dashboard-verif-queue");
  if (!container) return;

  if (docs.length === 0) {
    container.innerHTML = `
      <div class="queue-empty-box">
        <div class="queue-empty-icon">${Icons.checkCircle}</div>
        <div class="queue-empty-title">Semua Pembayaran Telah Terverifikasi</div>
        <div class="queue-empty-desc">Tidak ada berkas transfer orang tua yang sedang menunggu konfirmasi saat ini.</div>
      </div>
    `;
    return;
  }

  const list = docs.slice(0, 5);
  let rowsHtml = "";

  list.forEach((doc) => {
    const t = { id: doc.id, ...doc.data() };
    const tanggal = t.createdAt
      ? Helpers.formatTanggal(t.createdAt.toDate())
      : "-";

    rowsHtml += `
      <tr class="queue-table-row" onclick="Router.go('verifikasi')" style="cursor:pointer">
        <td>
          <div class="queue-student-name">${t.namaSiswa || "-"}</div>
          <div class="queue-student-meta">NIS: ${t.nis || "-"} &bull; Kelas: <span class="badge-kelas">${t.kelas || "-"}</span></div>
        </td>
        <td>
          <span class="badge-soft badge-soft-primary">${Helpers.periodeLabel(t.periode || "")}</span>
        </td>
        <td class="queue-amount-cell">
          ${Helpers.rupiah(t.nominal || 0)}
        </td>
        <td class="queue-date-cell">
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
