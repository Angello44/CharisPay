/* ============================================================
   Halaman Tagihan SPP (Orang Tua - Multi Anak Support)
   ============================================================ */

Router.register("tagihan", {
  title: "Tagihan SPP",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
      <!-- Ringkasan Status Tagihan -->
      <div class="summary-tiles-grid" id="summary-tagihan-ortu">
        <div class="summary-tile">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Total</div>
        </div>
        <div class="summary-tile warning">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Belum Lunas</div>
        </div>
        <div class="summary-tile success">
          <div class="summary-tile-num">-</div>
          <div class="summary-tile-label">Lunas</div>
        </div>
      </div>

      <!-- Filter Tab Anak (Multi-Anak Switcher) -->
      <div id="tagihan-anak-filter-container"></div>

      <!-- Filter Status Pembayaran -->
      <div class="filter-tabs" id="tagihan-status-filter-tabs">
        <div class="filter-chip active" onclick="pilihFilterStatusTagihan('semua', this)">Semua</div>
        <div class="filter-chip" onclick="pilihFilterStatusTagihan('belum', this)">Belum Bayar</div>
        <div class="filter-chip" onclick="pilihFilterStatusTagihan('menunggu', this)">Menunggu</div>
        <div class="filter-chip" onclick="pilihFilterStatusTagihan('lunas', this)">Lunas</div>
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

let _tagihanDataCache = {
  siswaList: [],
  perSiswa: {},
  totalSummary: {
    totalCount: 0,
    belumCount: 0,
    menungguCount: 0,
    lunasCount: 0,
    totalNominalBelum: 0,
    totalNominalLunas: 0,
  },
};
let _activeStatusFilter = "semua";
let _activeAnakFilter = "semua"; // 'semua' atau siswaId

async function loadTagihanOrtuPage() {
  Helpers.loading("tagihan-ortu-list");
  try {
    _tagihanDataCache = await getTagihanOrtuPerSiswa();

    renderAnakFilterTabs();
    updateSummaryTagihanPage();
    renderDaftarTagihanPerAnak();
  } catch (err) {
    console.error(err);
    Helpers.errorState("tagihan-ortu-list", "Gagal memuat: " + err.message);
  }
}

/** Render tab pemilihan anak jika orang tua memiliki lebih dari 1 anak */
function renderAnakFilterTabs() {
  const container = document.getElementById("tagihan-anak-filter-container");
  if (!container) return;

  const { siswaList } = _tagihanDataCache;

  if (!siswaList || siswaList.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="filter-tabs" style="margin-bottom:8px">
      <div class="filter-chip ${_activeAnakFilter === "semua" ? "active" : ""}"
           onclick="pilihFilterAnakTagihan('semua', this)">
        Semua Anak (${siswaList.length})
      </div>
      ${siswaList
        .map(
          (s) => `
        <div class="filter-chip ${_activeAnakFilter === s.id ? "active" : ""}"
             onclick="pilihFilterAnakTagihan('${s.id}', this)">
          ${s.nama} (${s.kelas || "-"})
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function pilihFilterAnakTagihan(siswaId, el) {
  _activeAnakFilter = siswaId;
  if (el) {
    const parent = el.parentElement;
    parent.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  }
  updateSummaryTagihanPage();
  renderDaftarTagihanPerAnak();
}

function pilihFilterStatusTagihan(status, el) {
  _activeStatusFilter = status;
  if (el) {
    const parent = el.parentElement;
    parent.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  }
  renderDaftarTagihanPerAnak();
}

function updateSummaryTagihanPage() {
  const summaryEl = document.getElementById("summary-tagihan-ortu");
  if (!summaryEl) return;

  const { perSiswa, totalSummary } = _tagihanDataCache;

  let total = totalSummary.totalCount;
  let belum = totalSummary.belumCount;
  let lunas = totalSummary.lunasCount;

  // Jika memfilter anak tertentu
  if (_activeAnakFilter !== "semua" && perSiswa[_activeAnakFilter]) {
    const s = perSiswa[_activeAnakFilter].summary;
    total = s.total;
    belum = s.belum;
    lunas = s.lunas;
  }

  summaryEl.innerHTML = `
    <div class="summary-tile">
      <div class="summary-tile-num">${total}</div>
      <div class="summary-tile-label">Total</div>
    </div>
    <div class="summary-tile warning">
      <div class="summary-tile-num">${belum}</div>
      <div class="summary-tile-label">Belum Lunas</div>
    </div>
    <div class="summary-tile success">
      <div class="summary-tile-num">${lunas}</div>
      <div class="summary-tile-label">Lunas</div>
    </div>
  `;
}

function renderDaftarTagihanPerAnak() {
  const container = document.getElementById("tagihan-ortu-list");
  if (!container) return;

  const { siswaList, perSiswa } = _tagihanDataCache;

  if (!siswaList || siswaList.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:24px">
        <div class="empty-state-icon" style="color:var(--warning);background:var(--warning-light);margin-bottom:8px">
          ${Icons.alertCircle}
        </div>
        <div class="font-bold text-sm" style="color:var(--text);margin-bottom:4px">
          Belum Ada Data Anak yang Terhubung
        </div>
        <p class="text-xs text-secondary mb-12">
          Silakan buka Beranda untuk menghubungkan data siswa Anda.
        </p>
        <button class="btn btn-primary btn-sm" onclick="Router.go('dashboard-ortu')">
          Ke Beranda
        </button>
      </div>
    `;
    return;
  }

  // Tentukan daftar siswa yang akan ditampilkan
  let targetSiswa = siswaList;
  if (_activeAnakFilter !== "semua") {
    targetSiswa = siswaList.filter((s) => s.id === _activeAnakFilter);
  }

  let html = "";
  let totalDitemukan = 0;

  targetSiswa.forEach((siswa) => {
    const entry = perSiswa[siswa.id];
    if (!entry) return;

    let tagihan = entry.tagihan;

    // Filter status
    if (_activeStatusFilter === "belum") {
      tagihan = tagihan.filter(
        (t) =>
          t.status === "belum" ||
          t.status === "revisi" ||
          t.status === "ditolak",
      );
    } else if (_activeStatusFilter === "menunggu") {
      tagihan = tagihan.filter((t) => t.status === "menunggu");
    } else if (_activeStatusFilter === "lunas") {
      tagihan = tagihan.filter((t) => t.status === "lunas");
    }

    if (tagihan.length === 0 && _activeStatusFilter !== "semua") {
      return; // lewati anak ini jika tidak punya tagihan di filter ini
    }

    totalDitemukan += tagihan.length;

    const summary = entry.summary;
    const initial = (siswa.nama || "S").charAt(0).toUpperCase();

    html += `
      <div class="child-group-card">
        <div class="child-group-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="child-avatar-pill">${initial}</div>
            <div>
              <div class="font-bold text-sm">${siswa.nama}</div>
              <div class="text-xs text-secondary">
                Kelas ${siswa.kelas || "-"} &bull; NIS: ${siswa.nis || "-"}
              </div>
            </div>
          </div>
          <div style="text-align:right">
            ${
              summary.belum > 0
                ? `<span class="badge badge-belum" style="font-size:11px">${summary.belum} Belum Lunas</span>`
                : `<span class="badge badge-lunas" style="font-size:11px">Lunas</span>`
            }
          </div>
        </div>

        <div class="child-group-bills">
          ${
            tagihan.length === 0
              ? `
            <div class="empty-state" style="padding:16px 0">
              <div class="empty-state-text text-secondary" style="font-size:12px">
                Tidak ada tagihan untuk siswa ini pada status yang dipilih.
              </div>
            </div>
          `
              : tagihan
                  .map((t) => {
                    const isLunas = t.status === "lunas";
                    const isBelum =
                      t.status === "belum" ||
                      t.status === "revisi" ||
                      t.status === "ditolak";
                    const icon = isLunas ? Icons.checkCircle : Icons.receipt;

                    return `
              <div class="bill-card" onclick="Router.go('detail-tagihan', '${t.id}')"
                   style="margin-bottom:8px;border-left:3px solid ${isLunas ? "var(--success)" : "var(--primary)"}">
                <div class="bill-card-left">
                  <div class="bill-icon-box" style="${isLunas ? "background:#dcfce7;color:#16a34a" : ""}">
                    ${icon}
                  </div>
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
                  })
                  .join("")
          }
        </div>
      </div>
    `;
  });

  if (totalDitemukan === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.receipt}</div>
        <div class="empty-state-text">Tidak ada tagihan pada filter status ini.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = html;
}
