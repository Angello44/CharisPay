/* ============================================================
   Halaman Tagihan SPP (Orang Tua)
   ============================================================ */

Router.register("tagihan", {
  title: "Tagihan SPP",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
            <!-- Ringkasan -->
            <div class="summary-tiles-grid" id="summary-tagihan-ortu">
                <div class="summary-tile"><div class="summary-tile-num">-</div><div class="summary-tile-label">Total</div></div>
                <div class="summary-tile warning"><div class="summary-tile-num">-</div><div class="summary-tile-label">Belum Lunas</div></div>
                <div class="summary-tile success"><div class="summary-tile-num">-</div><div class="summary-tile-label">Lunas</div></div>
            </div>

            <!-- Filter Status -->
            <div class="filter-tabs" id="tagihan-filter-tabs">
                <div class="filter-chip active" onclick="filterTagihanPage('semua', this)">Semua</div>
                <div class="filter-chip" onclick="filterTagihanPage('belum', this)">Belum Bayar</div>
                <div class="filter-chip" onclick="filterTagihanPage('menunggu', this)">Menunggu</div>
                <div class="filter-chip" onclick="filterTagihanPage('lunas', this)">Lunas</div>
            </div>

            <!-- Daftar Tagihan per Anak -->
            <div id="tagihan-ortu-list">
                <div class="loading">Memuat tagihan...</div>
            </div>
        `;
  },

  async init() {
    await loadTagihanOrtuPage();
  },
});

let _tagihanPerSiswaCache = {}; // { siswaId: { siswa, tagihan[] } }
let _currentFilter = "semua";

async function loadTagihanOrtuPage() {
  Helpers.loading("tagihan-ortu-list");
  try {
    _tagihanPerSiswaCache = await getTagihanOrtuPerSiswa();

    // Hitung summary dari semua tagihan gabungan
    let totalAll = 0,
      belumAll = 0,
      lunasAll = 0;
    Object.values(_tagihanPerSiswaCache).forEach(({ tagihan }) => {
      tagihan.forEach((t) => {
        totalAll++;
        if (
          t.status === "belum" ||
          t.status === "revisi" ||
          t.status === "ditolak"
        )
          belumAll++;
        else if (t.status === "lunas") lunasAll++;
      });
    });

    const summaryEl = document.getElementById("summary-tagihan-ortu");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-tile">
                    <div class="summary-tile-num">${totalAll}</div>
                    <div class="summary-tile-label">Total</div>
                </div>
                <div class="summary-tile warning">
                    <div class="summary-tile-num">${belumAll}</div>
                    <div class="summary-tile-label">Belum Lunas</div>
                </div>
                <div class="summary-tile success">
                    <div class="summary-tile-num">${lunasAll}</div>
                    <div class="summary-tile-label">Lunas</div>
                </div>
            `;
    }

    renderFilteredTagihan();
  } catch (err) {
    console.error(err);
    Helpers.errorState("tagihan-ortu-list", "Gagal memuat: " + err.message);
  }
}

function filterTagihanPage(filter, el) {
  _currentFilter = filter;
  if (el) {
    document
      .querySelectorAll(".filter-chip")
      .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  }
  renderFilteredTagihan();
}

function renderFilteredTagihan() {
  const container = document.getElementById("tagihan-ortu-list");
  if (!container) return;

  const entries = Object.values(_tagihanPerSiswaCache);

  // Kalau tidak ada data sama sekali
  if (entries.length === 0) {
    container.innerHTML = `
            <div class="card" style="text-align:center;padding:24px">
                <p class="text-sm" style="color:var(--warning)">
                    ⚠️ Belum ada data anak yang terhubung.<br>
                    Buka Beranda dan hubungkan data anak Anda.
                </p>
                <button class="btn btn-primary btn-sm mt-12"
                        onclick="Router.go('dashboard-ortu')">
                    Ke Beranda
                </button>
            </div>
        `;
    return;
  }

  let html = "";
  let adaTagihan = false;

  entries.forEach(({ siswa, tagihan }) => {
    // Filter tagihan sesuai filter aktif
    let filtered = tagihan;
    if (_currentFilter === "belum") {
      filtered = tagihan.filter(
        (t) =>
          t.status === "belum" ||
          t.status === "revisi" ||
          t.status === "ditolak",
      );
    } else if (_currentFilter === "menunggu") {
      filtered = tagihan.filter((t) => t.status === "menunggu");
    } else if (_currentFilter === "lunas") {
      filtered = tagihan.filter((t) => t.status === "lunas");
    }

    // Skip siswa yang tidak punya tagihan di filter ini
    if (filtered.length === 0) return;
    adaTagihan = true;

    // Header per anak
    html += `
            <div style="margin-bottom:4px;margin-top:12px">
                <div style="display:flex;align-items:center;gap:8px;padding:10px 4px">
                    <div style="
                        width:36px;height:36px;border-radius:50%;
                        background:var(--primary);color:white;
                        display:flex;align-items:center;justify-content:center;
                        font-weight:700;font-size:16px;flex-shrink:0
                    ">${siswa.nama.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-weight:600;font-size:15px">${siswa.nama}</div>
                        <div style="font-size:12px;color:var(--text-secondary)">
                            ${siswa.kelas || "-"} &middot; NIS: ${siswa.nis || "-"}
                        </div>
                    </div>
                    <div style="margin-left:auto">
                        <span class="badge" style="background:var(--primary-light);color:var(--primary)">
                            ${filtered.length} tagihan
                        </span>
                    </div>
                </div>
            </div>
        `;

    // Tagihan per anak
    filtered.forEach((t) => {
      const isLunas = t.status === "lunas";
      const isBelum =
        t.status === "belum" || t.status === "revisi" || t.status === "ditolak";

      html += `
                <div class="bill-card" onclick="Router.go('detail-tagihan', '${t.id}')"
                     style="margin-left:12px;border-left:3px solid var(--primary)">
                    <div class="bill-card-left">
                        <div class="bill-card-info">
                            <div class="bill-card-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
                            <div class="bill-card-meta">
                                ${t.jatuhTempo ? `<span>Jatuh tempo: ${t.jatuhTempo}</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="bill-card-right">
                        <div class="bill-card-amount">${Helpers.rupiah(t.nominal)}</div>
                        ${Helpers.badge(t.status)}
                    </div>
                </div>
            `;
    });
  });

  if (!adaTagihan) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <div class="empty-state-text">Tidak ada tagihan pada filter ini</div>
            </div>
        `;
    return;
  }

  container.innerHTML = html;
}
