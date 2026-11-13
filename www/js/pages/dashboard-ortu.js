/* ============================================================
   Dashboard Orang Tua (Clean Vector Icons UI - Multi-Anak Support)
   ============================================================ */

Router.register("dashboard-ortu", {
  title: "Beranda",
  header: false,
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Orang Tua";

    return `
      <!-- 1. Topbar Salam & Profil Ortu -->
      <div class="parent-topbar">
        <div class="parent-user-info">
          <div class="parent-avatar">${nama.charAt(0).toUpperCase()}</div>
          <div>
            <div class="parent-greeting-subtitle">Selamat datang,</div>
            <div class="parent-greeting-name">${nama}</div>
          </div>
        </div>
        <div class="parent-topbar-actions">
          <button class="parent-icon-btn" onclick="Router.go('panduan')" title="Bantuan">
            ${Icons.guide}
          </button>
          <button class="parent-icon-btn" onclick="konfirmasiLogout()" title="Keluar">
            ${Icons.logout}
          </button>
        </div>
      </div>

      <!-- 2. Kartu Identitas Siswa Terhubung / Multi-Anak Switcher -->
      <div id="section-identitas-siswa">
        <div class="student-banner-card">
          <div class="student-banner-left">
            <div class="student-badge-icon">${Icons.student}</div>
            <div class="student-banner-details">
              <div class="student-banner-title">Memuat data anak...</div>
              <div class="student-banner-sub">Sinkronisasi data sekolah</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Hero Highlight Card (Tagihan SPP Prioritas / Multi-Anak Breakdown) -->
      <div id="section-hero-tagihan">
        <div class="hero-bill-card">
          <div class="hero-label">Status Tagihan SPP</div>
          <div class="hero-amount">Memeriksa...</div>
          <div class="hero-subtitle">Sedang memuat data tagihan terbaru</div>
        </div>
      </div>

      <!-- 4. Ringkasan Status Tagihan (3 Mini Tiles) -->
      <div class="summary-tiles-grid" id="summary-dashboard-ortu">
        <div class="summary-tile">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Total Tagihan</div>
        </div>
        <div class="summary-tile warning">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Belum Lunas</div>
        </div>
        <div class="summary-tile success">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Sudah Lunas</div>
        </div>
      </div>

      <!-- 5. Menu Aksi Cepat (Quick Actions Grid) -->
      <div class="quick-action-section">
        <div class="section-header">
          <div class="section-title">Layanan Utama</div>
        </div>
        <div class="quick-action-grid">
          <button class="quick-action-item" onclick="aksiBayarSPP()">
            <div class="quick-action-icon qa-blue">${Icons.wallet}</div>
            <span class="quick-action-label">Bayar SPP</span>
          </button>

          <button class="quick-action-item" onclick="Router.go('tagihan')">
            <div class="quick-action-icon qa-indigo">${Icons.receipt}</div>
            <span class="quick-action-label">Semua Tagihan</span>
          </button>

          <button class="quick-action-item" onclick="Router.go('riwayat')">
            <div class="quick-action-icon qa-emerald">${Icons.history}</div>
            <span class="quick-action-label">Riwayat</span>
          </button>

          <button class="quick-action-item" onclick="Router.go('nilai-ortu')">
            <div class="quick-action-icon qa-amber">${Icons.grade}</div>
            <span class="quick-action-label">Nilai Rapor</span>
          </button>

          <button class="quick-action-item" onclick="bukaModalWaliKelas()">
            <div class="quick-action-icon qa-cyan">${Icons.teacher}</div>
            <span class="quick-action-label">Wali Kelas</span>
          </button>

          <button class="quick-action-item" onclick="showModalTambahAnak()">
            <div class="quick-action-icon qa-pink">${Icons.students}</div>
            <span class="quick-action-label">Data Anak</span>
          </button>

          <button class="quick-action-item" onclick="Router.go('panduan')">
            <div class="quick-action-icon qa-purple">${Icons.guide}</div>
            <span class="quick-action-label">Panduan</span>
          </button>

          <button class="quick-action-item" onclick="hubungiAdminWA()">
            <div class="quick-action-icon qa-emerald">${Icons.chat}</div>
            <span class="quick-action-label">Bantuan WA</span>
          </button>
        </div>
      </div>

      <!-- 6. Tagihan Terkini -->
      <div class="section-header">
        <div class="section-title">Tagihan Terkini</div>
        <span class="section-link" onclick="Router.go('tagihan')">
          <span>Lihat Semua</span>
          ${Icons.chevronRight}
        </span>
      </div>
      <div id="dashboard-tagihan-terbaru">
        <div class="loading">Memuat tagihan...</div>
      </div>

      <!-- 7. Kartu Bantuan & Konsultasi -->
      <div class="help-card-banner">
        <p>Ada kendala atau pertanyaan seputar pembayaran SPP?</p>
        <a class="help-link" onclick="hubungiAdminWA()">
          ${Icons.chat} Hubungi Petugas Keuangan Sekolah
        </a>
      </div>

      <!-- Modal Tambah Data Anak -->
      <div id="modal-tambah-anak" class="modal-overlay hidden">
        <div class="modal" style="max-height:90vh;overflow-y:auto">
          <div class="modal-title">Kelola Data Anak</div>
          <p class="text-sm text-secondary mb-16">
            Hubungkan akun orang tua dengan data siswa di sekolah menggunakan Nama atau NIS.
          </p>

          <div class="form-group">
            <label>Cari Nama Siswa atau NIS</label>
            <div style="display:flex;gap:8px">
              <input type="text" id="input-cari-anak"
                     placeholder="cth: Budi Santoso atau 2024001"
                     style="flex:1"
                     onkeydown="if(event.key==='Enter') cariSiswaOrtu()">
              <button class="btn btn-primary btn-sm" style="white-space:nowrap" onclick="cariSiswaOrtu()">
                Cari
              </button>
            </div>
            <div class="form-hint">Ketik nama lengkap atau Nomor Induk Siswa</div>
          </div>

          <div id="hasil-cari-anak"></div>

          <div id="modal-daftar-anak-terhubung" class="mt-16"></div>

          <button class="btn btn-secondary mt-16" onclick="tutupModalTambahAnak()">
            Tutup
          </button>
        </div>
      </div>

      <!-- Modal Info Wali Kelas -->
      <div id="modal-wali-info" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-title">Kontak Wali Kelas</div>
          <div id="modal-wali-content" class="mb-16">
            <div class="loading">Memuat informasi wali kelas...</div>
          </div>
          <button class="btn btn-secondary" onclick="tutupModalWaliKelas()">
            Tutup
          </button>
        </div>
      </div>
    `;
  },

  async init() {
    await loadDashboardOrtu();
  },
});

let _currentSiswaList = [];
let _currentTagihanList = [];
let _selectedSiswaFilter = "all"; // 'all' atau siswaId

async function loadDashboardOrtu() {
  try {
    const siswaList = await getSiswaOrtu();
    _currentSiswaList = siswaList;

    const tagihan = await getTagihanOrtu();
    _currentTagihanList = tagihan;

    renderIdentitasSiswa(siswaList);
    updateDashboardView();
  } catch (err) {
    console.error("Gagal load dashboard ortu:", err);
    Helpers.errorState(
      "dashboard-tagihan-terbaru",
      "Gagal memuat data: " + err.message,
    );
  }
}

/** Filter tampilan dashboard berdasarkan anak yang dipilih */
function pilihFilterSiswaDashboard(siswaId) {
  _selectedSiswaFilter = siswaId;
  renderIdentitasSiswa(_currentSiswaList);
  updateDashboardView();
}

/** Perbarui tampilan Hero, Summary, dan Tagihan Terkini sesuai filter siswa */
function updateDashboardView() {
  const filteredTagihan =
    _selectedSiswaFilter === "all"
      ? _currentTagihanList
      : _currentTagihanList.filter((t) => t.siswaId === _selectedSiswaFilter);

  renderHeroTagihan(filteredTagihan, _currentSiswaList, _selectedSiswaFilter);
  renderSummaryTiles(filteredTagihan);
  renderTagihanTerkini(filteredTagihan);
}

function renderIdentitasSiswa(siswaList) {
  const container = document.getElementById("section-identitas-siswa");
  if (!container) return;

  if (!siswaList || siswaList.length === 0) {
    container.innerHTML = `
      <div class="student-banner-card" style="background:#fffbeb;border-color:#fde68a">
        <div class="student-banner-left">
          <div class="student-badge-icon" style="background:#fef3c7;color:#d97706">${Icons.alertCircle}</div>
          <div class="student-banner-details">
            <div class="student-banner-title">Data Siswa Belum Terhubung</div>
            <div class="student-banner-sub">Hubungkan akun Anda dengan siswa sekolah</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm student-banner-action" onclick="showModalTambahAnak()">
          Hubungkan
        </button>
      </div>
    `;
    return;
  }

  // Jika hanya ada 1 anak
  if (siswaList.length === 1) {
    const s = siswaList[0];
    container.innerHTML = `
      <div class="student-banner-card">
        <div class="student-banner-left" onclick="showModalTambahAnak()" style="cursor:pointer">
          <div class="student-badge-icon">${Icons.student}</div>
          <div class="student-banner-details">
            <div class="student-banner-title">${s.nama}</div>
            <div class="student-banner-sub">
              <span>Kelas ${s.kelas || "-"}</span>
              <span>&bull;</span>
              <span>NIS: ${s.nis || "-"}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm student-banner-action" onclick="showModalTambahAnak()">
          Kelola
        </button>
      </div>
    `;
    return;
  }

  // Jika memiliki 2 anak atau lebih (Multi-Anak)
  const pillsHtml = `
    <div class="filter-tabs" style="margin-top:8px;margin-bottom:0">
      <div class="filter-chip ${_selectedSiswaFilter === "all" ? "active" : ""}"
           onclick="pilihFilterSiswaDashboard('all')">
        Semua Anak (${siswaList.length})
      </div>
      ${siswaList
        .map(
          (s) => `
        <div class="filter-chip ${_selectedSiswaFilter === s.id ? "active" : ""}"
             onclick="pilihFilterSiswaDashboard('${s.id}')">
          ${s.nama.split(" ")[0]} (${s.kelas || "-"})
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  container.innerHTML = `
    <div class="student-banner-card" style="flex-direction:column;align-items:stretch">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="student-banner-left">
          <div class="student-badge-icon" style="background:#e0e7ff;color:#4f46e5">${Icons.students}</div>
          <div class="student-banner-details">
            <div class="student-banner-title">Keluarga (${siswaList.length} Anak Terdaftar)</div>
            <div class="student-banner-sub">
              ${siswaList.map((s) => `${s.nama} (${s.kelas || "-"})`).join(" &bull; ")}
            </div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm student-banner-action" onclick="showModalTambahAnak()">
          Kelola
        </button>
      </div>
      ${pillsHtml}
    </div>
  `;
}

function renderHeroTagihan(tagihan, siswaList, filterSiswaId) {
  const heroContainer = document.getElementById("section-hero-tagihan");
  if (!heroContainer) return;

  const unpaidBills = tagihan.filter(
    (t) =>
      t.status === "belum" || t.status === "revisi" || t.status === "ditolak",
  );
  const waitingBills = tagihan.filter((t) => t.status === "menunggu");

  // Kasus 1: Ada tagihan belum lunas
  if (unpaidBills.length > 0) {
    const totalNominal = unpaidBills.reduce(
      (sum, t) => sum + (Number(t.nominal) || 0),
      0,
    );

    // Jika filter "Semua Anak" dan ada lebih dari 1 tagihan belum lunas
    if (filterSiswaId === "all" && unpaidBills.length > 1) {
      const breakdownHtml = unpaidBills
        .slice(0, 3)
        .map(
          (t) => `
        <div class="hero-breakdown-item">
          <div>
            <div class="hero-breakdown-item-name">${t.namaSiswa || "Siswa"}</div>
            <div class="hero-breakdown-item-sub">SPP ${Helpers.periodeLabel(t.periode)} &bull; ${t.kelas || ""}</div>
          </div>
          <div style="display:flex;align-items:center">
            <span class="hero-breakdown-item-amt">${Helpers.rupiah(t.nominal)}</span>
            <button class="hero-mini-pay-btn" onclick="Router.go('pembayaran', '${t.id}')">
              Bayar
            </button>
          </div>
        </div>
      `,
        )
        .join("");

      heroContainer.innerHTML = `
        <div class="hero-bill-card">
          <div class="hero-top-row">
            <div class="hero-tag">${unpaidBills.length} Tagihan Belum Lunas</div>
            <div class="hero-date-chip">${Helpers.hariTanggal()}</div>
          </div>
          <div class="hero-label">Total Tagihan Keluarga yang Perlu Dibayar:</div>
          <div class="hero-amount">${Helpers.rupiah(totalNominal)}</div>

          <div class="hero-breakdown-box">
            ${breakdownHtml}
            ${
              unpaidBills.length > 3
                ? `<div style="font-size:11px;opacity:0.85;text-align:center;padding-top:4px">+${unpaidBills.length - 3} tagihan lainnya</div>`
                : ""
            }
          </div>

          <button class="hero-action-btn" onclick="Router.go('tagihan')">
            ${Icons.receipt} Lihat Semua Tagihan Anak
          </button>
        </div>
      `;
      return;
    }

    // Tagihan tunggal aktif
    const utama = unpaidBills[0];
    const jatuhTempo = utama.jatuhTempo
      ? `Jatuh tempo: ${utama.jatuhTempo}`
      : "Harap bayar tepat waktu";
    const statusLabel =
      utama.status === "revisi" ? "Perlu Revisi Bukti" : "Belum Dibayar";

    heroContainer.innerHTML = `
      <div class="hero-bill-card">
        <div class="hero-top-row">
          <div class="hero-tag">SPP ${Helpers.periodeLabel(utama.periode)}</div>
          <div class="hero-date-chip">${jatuhTempo}</div>
        </div>
        <div class="hero-label">Tagihan yang Perlu Dibayar:</div>
        <div class="hero-amount">${Helpers.rupiah(utama.nominal)}</div>
        <div class="hero-subtitle">
          <span>${utama.namaSiswa || "Siswa"} (${utama.kelas || "-"})</span>
          <span>&bull;</span>
          <span>${statusLabel}</span>
        </div>
        <button class="hero-action-btn" onclick="Router.go('pembayaran', '${utama.id}')">
          ${Icons.wallet} Bayar Tagihan Sekarang
        </button>
      </div>
    `;
    return;
  }

  // Kasus 2: Ada tagihan menunggu verifikasi
  if (waitingBills.length > 0) {
    const utama = waitingBills[0];
    const totalMenunggu = waitingBills.reduce(
      (sum, t) => sum + (Number(t.nominal) || 0),
      0,
    );

    heroContainer.innerHTML = `
      <div class="hero-bill-card menunggu-state">
        <div class="hero-top-row">
          <div class="hero-tag">${waitingBills.length} Tagihan Menunggu</div>
          <div class="hero-date-chip">Dalam Proses</div>
        </div>
        <div class="hero-label">Menunggu Verifikasi Admin</div>
        <div class="hero-amount">${Helpers.rupiah(totalMenunggu)}</div>
        <div class="hero-subtitle">
          <span>${utama.namaSiswa || "Siswa"}</span>
          ${waitingBills.length > 1 ? `<span>(+${waitingBills.length - 1} lainnya)</span>` : ""}
          <span>&bull;</span>
          <span>Sedang ditinjau petugas</span>
        </div>
        <button class="hero-action-btn" onclick="Router.go('detail-tagihan', '${utama.id}')">
          ${Icons.receipt} Lihat Status Verifikasi
        </button>
      </div>
    `;
    return;
  }

  // Kasus 3: Semua tagihan sudah lunas
  if (tagihan.length > 0) {
    const namaAnakLabel =
      siswaList && siswaList.length > 0
        ? siswaList.map((s) => s.nama.split(" ")[0]).join(" & ")
        : "Anak Anda";

    heroContainer.innerHTML = `
      <div class="hero-bill-card lunas-state">
        <div class="hero-top-row">
          <div class="hero-tag">Status Keuangan</div>
          <div class="hero-date-chip">${Helpers.hariTanggal()}</div>
        </div>
        <div class="hero-label">Status Tagihan SPP</div>
        <div class="hero-amount">Lunas Terbayar</div>
        <div class="hero-subtitle">Seluruh kewajiban SPP untuk ${namaAnakLabel} telah diselesaikan. Terima kasih.</div>
        <button class="hero-action-btn" onclick="Router.go('riwayat')">
          ${Icons.history} Lihat Riwayat Transaksi
        </button>
      </div>
    `;
    return;
  }

  // Kasus 4: Belum ada tagihan sama sekali
  heroContainer.innerHTML = `
    <div class="hero-bill-card">
      <div class="hero-top-row">
        <div class="hero-tag">Informasi SPP</div>
        <div class="hero-date-chip">${Helpers.hariTanggal()}</div>
      </div>
      <div class="hero-label">Belum Ada Tagihan Aktif</div>
      <div class="hero-amount">Rp 0</div>
      <div class="hero-subtitle">Tagihan periode baru akan muncul otomatis di sini</div>
      <button class="hero-action-btn" onclick="Router.go('panduan')">
        ${Icons.guide} Panduan Pembayaran
      </button>
    </div>
  `;
}

function renderSummaryTiles(tagihan) {
  const counts = { total: tagihan.length, belum: 0, menunggu: 0, lunas: 0 };
  tagihan.forEach((t) => {
    if (
      t.status === "belum" ||
      t.status === "revisi" ||
      t.status === "ditolak"
    ) {
      counts.belum++;
    } else if (t.status === "menunggu") {
      counts.menunggu++;
    } else if (t.status === "lunas") {
      counts.lunas++;
    }
  });

  const summaryEl = document.getElementById("summary-dashboard-ortu");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-tile" onclick="Router.go('tagihan')">
        <div class="summary-tile-num">${counts.total}</div>
        <div class="summary-tile-label">Total Tagihan</div>
      </div>
      <div class="summary-tile warning" onclick="Router.go('tagihan')">
        <div class="summary-tile-num">${counts.belum}</div>
        <div class="summary-tile-label">Belum Lunas</div>
      </div>
      <div class="summary-tile success" onclick="Router.go('tagihan')">
        <div class="summary-tile-num">${counts.lunas}</div>
        <div class="summary-tile-label">Sudah Lunas</div>
      </div>
    `;
  }
}

function renderTagihanTerkini(tagihan) {
  const container = document.getElementById("dashboard-tagihan-terbaru");
  if (!container) return;

  if (!tagihan || tagihan.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.receipt}</div>
        <div class="empty-state-text">Tidak ada tagihan yang sesuai.</div>
      </div>
    `;
    return;
  }

  const terbaru = tagihan.slice(0, 4);
  container.innerHTML = terbaru
    .map((t) => {
      const isLunas = t.status === "lunas";
      const icon = isLunas ? Icons.checkCircle : Icons.receipt;
      const jatuhTempo = t.jatuhTempo ? `Jatuh tempo: ${t.jatuhTempo}` : "";

      return `
        <div class="bill-card" onclick="Router.go('detail-tagihan', '${t.id}')">
          <div class="bill-card-left">
            <div class="bill-icon-box" style="${isLunas ? "background:#dcfce7;color:#16a34a" : ""}">
              ${icon}
            </div>
            <div class="bill-card-info">
              <div class="bill-card-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
              <div class="bill-card-meta">
                <span class="font-semibold" style="color:var(--text)">${t.namaSiswa || "Siswa"}</span>
                ${t.kelas ? `<span>&bull;</span><span>${t.kelas}</span>` : ""}
                ${jatuhTempo ? `<span>&bull;</span><span>${jatuhTempo}</span>` : ""}
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
    .join("");
}

function aksiBayarSPP() {
  if (!_currentTagihanList || _currentTagihanList.length === 0) {
    Router.go("tagihan");
    return;
  }

  // Jika sedang memfilter 1 anak tertentu
  const targetList =
    _selectedSiswaFilter === "all"
      ? _currentTagihanList
      : _currentTagihanList.filter((t) => t.siswaId === _selectedSiswaFilter);

  const unpaid = targetList.filter(
    (t) =>
      t.status === "belum" || t.status === "revisi" || t.status === "ditolak",
  );

  if (unpaid.length === 1) {
    Router.go("pembayaran", unpaid[0].id);
  } else {
    Router.go("tagihan");
  }
}

function hubungiAdminWA() {
  const noWA = "6281234567890";
  const pesan = encodeURIComponent(
    `Halo Admin Keuangan Charis Institute, saya orang tua siswa ingin berkonsultasi mengenai pembayaran SPP.`,
  );
  window.open(`https://wa.me/${noWA}?text=${pesan}`, "_blank");
}

async function konfirmasiLogout() {
  const ok = await Helpers.confirm(
    "Apakah Bapak/Ibu yakin ingin keluar dari aplikasi?",
  );
  if (ok) {
    Auth.logout();
  }
}

async function bukaModalWaliKelas() {
  const modal = document.getElementById("modal-wali-info");
  const content = document.getElementById("modal-wali-content");
  modal.classList.remove("hidden");

  if (!_currentSiswaList || _currentSiswaList.length === 0) {
    content.innerHTML = `
      <div class="card" style="background:var(--warning-light);border-color:var(--warning-border)">
        <p class="text-sm" style="color:var(--warning-dark)">
          Belum ada anak yang terhubung ke akun Anda. Silakan hubungkan data anak terlebih dahulu.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `<div class="loading">Mengambil informasi wali kelas...</div>`;

  let html = "";
  for (const s of _currentSiswaList) {
    const wali = await getWaliByKelas(s.kelas);
    html += `
      <div class="card" style="margin-bottom:12px">
        <div class="card-title">${Icons.student} ${s.nama} (${s.kelas})</div>
        <div class="card-row">
          <span class="card-label">Nama Wali Kelas</span>
          <span class="card-value font-bold">${wali ? wali.namaWali : "Belum ditentukan"}</span>
        </div>
        ${
          wali && wali.noHp
            ? `
          <div class="card-row">
            <span class="card-label">Nomor WhatsApp</span>
            <span class="card-value font-semibold">${wali.noHp}</span>
          </div>
          <button class="btn btn-success btn-sm mt-8 w-full"
                  onclick="window.open('https://wa.me/${wali.noHp.replace(/[^0-9]/g, "")}?text=Halo%20Bapak%2FIbu%20Wali%20Kelas%2C%20saya%20wali%20dari%20${encodeURIComponent(s.nama)}', '_blank')">
            ${Icons.chat} Hubungi via WhatsApp
          </button>
        `
            : `
          <div class="card-row">
            <span class="card-label">Kontak</span>
            <span class="card-value text-secondary">Silakan hubungi bagian tata usaha</span>
          </div>
        `
        }
      </div>
    `;
  }

  content.innerHTML = html;
}

function tutupModalWaliKelas() {
  document.getElementById("modal-wali-info").classList.add("hidden");
}

function showModalTambahAnak() {
  document.getElementById("input-cari-anak").value = "";
  document.getElementById("hasil-cari-anak").innerHTML = "";
  renderModalAnakTerhubung();
  document.getElementById("modal-tambah-anak").classList.remove("hidden");
}

function tutupModalTambahAnak() {
  document.getElementById("modal-tambah-anak").classList.add("hidden");
}

function renderModalAnakTerhubung() {
  const container = document.getElementById("modal-daftar-anak-terhubung");
  if (!container) return;

  if (!_currentSiswaList || _currentSiswaList.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="card-title">Anak yang Terhubung:</div>
    ${_currentSiswaList
      .map(
        (s) => `
      <div class="card" style="padding:10px 14px;margin-bottom:8px">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold text-sm">${s.nama}</div>
            <div class="text-xs text-secondary">Kelas ${s.kelas || "-"} &bull; NIS: ${s.nis || "-"}</div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="lepasAnak('${s.id}', '${s.nama}')">
            Lepas
          </button>
        </div>
      </div>
    `,
      )
      .join("")}
  `;
}

async function cariSiswaOrtu() {
  const keyword = document.getElementById("input-cari-anak").value.trim();
  const hasilEl = document.getElementById("hasil-cari-anak");

  if (!keyword || keyword.length < 2) {
    hasilEl.innerHTML = `<div class="form-error">Masukkan minimal 2 karakter untuk pencarian</div>`;
    return;
  }

  hasilEl.innerHTML = `<div class="loading">Mencari data siswa...</div>`;

  try {
    const snapAll = await db.collection("siswa").get();
    const kwLower = keyword.toLowerCase();

    const semuaDoc = snapAll.docs.filter((d) => {
      const s = d.data();
      const namaMatch = (s.nama || "").toLowerCase().includes(kwLower);
      const nisMatch = (s.nis || "").toLowerCase().includes(kwLower);
      const kelasMatch = (s.kelas || "").toLowerCase() === kwLower;
      return namaMatch || nisMatch || kelasMatch;
    });

    if (semuaDoc.length === 0) {
      hasilEl.innerHTML = `
        <div class="card" style="background:var(--danger-light);border-color:var(--danger-border);margin-top:8px">
          <p class="text-sm" style="color:var(--danger-dark)">
            Data siswa tidak ditemukan. Pastikan nama atau NIS sesuai data sekolah.
          </p>
        </div>
      `;
      return;
    }

    const siswaIds = Auth.getSiswaIds();
    let html = `<div class="text-xs font-bold text-secondary mt-8 mb-8">Hasil Pencarian (${semuaDoc.length}):</div>`;

    for (const doc of semuaDoc) {
      const s = { id: doc.id, ...doc.data() };
      const sudahTerhubung = siswaIds.includes(s.id);
      const sudahAdaOrtu = s.ortuId && s.ortuId !== Auth.getUid();

      html += `
        <div class="card" style="margin-bottom:10px">
          <div class="card-row">
            <span class="card-label">Nama Siswa</span>
            <span class="card-value font-bold">${s.nama}</span>
          </div>
          <div class="card-row">
            <span class="card-label">NIS</span>
            <span class="card-value">${s.nis || "-"}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Kelas</span>
            <span class="card-value">${s.kelas || "-"}</span>
          </div>
          ${
            sudahTerhubung
              ? `
            <div class="card" style="background:var(--success-light);border-color:var(--success-border);margin-top:8px">
              <p class="text-xs font-semibold" style="color:var(--success-dark)">Sudah terhubung ke akun Anda</p>
            </div>
          `
              : sudahAdaOrtu
                ? `
            <div class="card" style="background:var(--warning-light);border-color:var(--warning-border);margin-top:8px">
              <p class="text-xs" style="color:var(--warning-dark)">
                Siswa sudah dihubungkan ke akun orang tua lain.
              </p>
            </div>
          `
                : `
            <button class="btn btn-primary btn-sm mt-8 w-full"
                    onclick="hubungkanAnak('${s.id}', '${s.nama}', '${s.kelas}')">
              Hubungkan Siswa Ini
            </button>
          `
          }
        </div>
      `;
    }

    hasilEl.innerHTML = html;
  } catch (err) {
    console.error("Gagal cari siswa:", err);
    hasilEl.innerHTML = `<div class="form-error">Gagal mencari: ${err.message}</div>`;
  }
}

async function hubungkanAnak(siswaId, namaSiswa, kelas) {
  try {
    const uid = Auth.getUid();

    await db
      .collection("siswa")
      .doc(siswaId)
      .update({
        ortuId: uid,
        ortuNama: Auth.profile ? Auth.profile.nama : "",
        ortuEmail: Auth.user ? Auth.user.email : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    const siswaIds = Auth.getSiswaIds();
    if (!siswaIds.includes(siswaId)) siswaIds.push(siswaId);
    Auth.profile.siswaIds = siswaIds;

    await db.collection("users").doc(uid).update({ siswaIds });

    Router.toast(`${namaSiswa} berhasil dihubungkan`);
    tutupModalTambahAnak();
    await loadDashboardOrtu();
  } catch (err) {
    Router.toast("Gagal menghubungkan: " + err.message);
  }
}

async function lepasAnak(siswaId, namaSiswa) {
  const ok = await Helpers.confirm(
    `Apakah Bapak/Ibu yakin ingin melepas "${namaSiswa}" dari akun ini?`,
  );
  if (!ok) return;

  try {
    const uid = Auth.getUid();

    await db.collection("siswa").doc(siswaId).update({
      ortuId: firebase.firestore.FieldValue.delete(),
      ortuNama: firebase.firestore.FieldValue.delete(),
      ortuEmail: firebase.firestore.FieldValue.delete(),
    });

    const siswaIds = Auth.getSiswaIds().filter((id) => id !== siswaId);
    Auth.profile.siswaIds = siswaIds;
    await db.collection("users").doc(uid).update({ siswaIds });

    Router.toast(`${namaSiswa} berhasil dilepas`);
    tutupModalTambahAnak();
    await loadDashboardOrtu();
  } catch (err) {
    Router.toast("Gagal: " + err.message);
  }
}
