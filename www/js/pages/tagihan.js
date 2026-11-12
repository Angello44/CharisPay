/* ============================================================
   Halaman Tagihan SPP (Orang Tua - Clean Vector UI)
   ============================================================ */

Router.register("tagihan", {
  title: "Tagihan SPP",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
      <!-- Ringkasan Mini -->
      <div class="summary-tiles-grid" id="summary-tagihan-ortu">
        <div class="summary-tile"><div class="summary-tile-num">-</div><div class="summary-tile-label">Total</div></div>
        <div class="summary-tile warning"><div class="summary-tile-num">-</div><div class="summary-tile-label">Belum Lunas</div></div>
        <div class="summary-tile success"><div class="summary-tile-num">-</div><div class="summary-tile-label">Lunas</div></div>
      </div>

      <!-- Filter Kategori Status -->
      <div class="filter-tabs" id="tagihan-filter-tabs">
        <div class="filter-chip active" onclick="filterTagihanPage('semua', this)">Semua Tagihan</div>
        <div class="filter-chip" onclick="filterTagihanPage('belum', this)">Belum Bayar</div>
        <div class="filter-chip" onclick="filterTagihanPage('menunggu', this)">Menunggu Verifikasi</div>
        <div class="filter-chip" onclick="filterTagihanPage('lunas', this)">Sudah Lunas</div>
      </div>

      <!-- Daftar Tagihan -->
      <div id="tagihan-ortu-list">
        <div class="loading">Memuat tagihan...</div>
      </div>
    `;
  },

  async init() {
    await loadTagihanOrtuPage();
  },
});

let _allTagihanCache = [];
let _currentFilter = "semua";

async function loadTagihanOrtuPage() {
  Helpers.loading("tagihan-ortu-list");
  try {
    const tagihan = await getTagihanOrtu();
    _allTagihanCache = tagihan;

    const counts = { belum: 0, menunggu: 0, lunas: 0, total: tagihan.length };
    tagihan.forEach((t) => {
      if (t.status === "belum" || t.status === "revisi" || t.status === "ditolak") {
        counts.belum++;
      } else if (t.status === "menunggu") {
        counts.menunggu++;
      } else if (t.status === "lunas") {
        counts.lunas++;
      }
    });

    const summaryEl = document.getElementById("summary-tagihan-ortu");
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-tile" onclick="filterTagihanPage('semua')">
          <div class="summary-tile-num">${counts.total}</div>
          <div class="summary-tile-label">Total</div>
        </div>
        <div class="summary-tile warning" onclick="filterTagihanPage('belum')">
          <div class="summary-tile-num">${counts.belum}</div>
          <div class="summary-tile-label">Belum Lunas</div>
        </div>
        <div class="summary-tile success" onclick="filterTagihanPage('lunas')">
          <div class="summary-tile-num">${counts.lunas}</div>
          <div class="summary-tile-label">Sudah Lunas</div>
        </div>
      `;
    }

    renderFilteredTagihan();
  } catch (err) {
    console.error("Gagal load tagihan:", err);
    Helpers.errorState("tagihan-ortu-list", "Gagal memuat: " + err.message);
  }
}

function filterTagihanPage(filter, el) {
  _currentFilter = filter;
  if (el) {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  } else {
    const chips = document.querySelectorAll(".filter-chip");
    chips.forEach((c) => {
      const match =
        (filter === "semua" && c.textContent.includes("Semua")) ||
        (filter === "belum" && c.textContent.includes("Belum")) ||
        (filter === "lunas" && c.textContent.includes("Sudah"));
      if (match) c.classList.add("active");
      else c.classList.remove("active");
    });
  }
  renderFilteredTagihan();
}

function renderFilteredTagihan() {
  const container = document.getElementById("tagihan-ortu-list");
  if (!container) return;

  if (_allTagihanCache.length === 0) {
    const siswaIds = Auth.getSiswaIds();
    if (siswaIds.length === 0) {
      container.innerHTML = `
        <div class="card" style="background:#fffbeb;border-color:#fde68a;padding:20px;text-align:center">
          <div class="empty-state-icon" style="color:#d97706;background:#fef3c7">${Icons.students}</div>
          <div class="font-bold text-sm" style="color:#b45309">Data Siswa Belum Terhubung</div>
          <p class="text-xs text-secondary mt-4">
            Silakan buka Beranda dan hubungkan akun Anda dengan Nama/NIS anak Anda.
          </p>
          <button class="btn btn-primary btn-sm mt-12" onclick="Router.go('dashboard-ortu')">
            Kembali ke Beranda
          </button>
        </div>
      `;
    } else {
      Helpers.emptyState("tagihan-ortu-list", Icons.receipt, "Belum ada daftar tagihan.");
    }
    return;
  }

  let list = _allTagihanCache;
  if (_currentFilter === "belum") {
    list = list.filter((t) => t.status === "belum" || t.status === "revisi" || t.status === "ditolak");
  } else if (_currentFilter === "menunggu") {
    list = list.filter((t) => t.status === "menunggu");
  } else if (_currentFilter === "lunas") {
    list = list.filter((t) => t.status === "lunas");
  }

  if (list.length === 0) {
    Helpers.emptyState("tagihan-ortu-list", Icons.search, "Tidak ada tagihan pada filter ini.");
    return;
  }

  container.innerHTML = list
    .map((t) => {
      const isLunas = t.status === "lunas";
      const isBelum = t.status === "belum" || t.status === "revisi" || t.status === "ditolak";
      const icon = isLunas ? Icons.checkCircle : isBelum ? Icons.wallet : Icons.clock;
      const jatuhTempo = t.jatuhTempo ? `Jatuh tempo: ${t.jatuhTempo}` : "";

      return `
        <div class="bill-card" onclick="Router.go('detail-tagihan', '${t.id}')">
          <div class="bill-card-left">
            <div class="bill-icon-box" style="${isLunas ? 'background:#dcfce7;color:#16a34a' : ''}">
              ${icon}
            </div>
            <div class="bill-card-info">
              <div class="bill-card-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
              <div class="bill-card-meta">
                <span>${t.namaSiswa || "Siswa"}</span>
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
