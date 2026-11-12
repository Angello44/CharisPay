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
            <div class="summary-grid" id="summary-tagihan-ortu"></div>
            <div class="section-title">Daftar Tagihan</div>
            <div id="tagihan-ortu-list"><div class="loading">Memuat tagihan...</div></div>
        `;
  },

  async init() {
    await loadTagihanOrtuPage();
  },
});

async function loadTagihanOrtuPage() {
  Helpers.loading("tagihan-ortu-list");
  try {
    const tagihan = await getTagihanOrtu();

    // Hitung summary
    const counts = { belum: 0, menunggu: 0, lunas: 0, total: tagihan.length };
    tagihan.forEach((t) => {
      if (
        t.status === "belum" ||
        t.status === "revisi" ||
        t.status === "ditolak"
      )
        counts.belum++;
      else if (t.status === "menunggu") counts.menunggu++;
      else if (t.status === "lunas") counts.lunas++;
    });

    const summaryEl = document.getElementById("summary-tagihan-ortu");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card primary"><div class="summary-number">${counts.total}</div><div class="summary-label">Total Tagihan</div></div>
                <div class="summary-card warning"><div class="summary-number">${counts.belum}</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">${counts.menunggu}</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">${counts.lunas}</div><div class="summary-label">Lunas</div></div>
            `;
    }

    if (tagihan.length === 0) {
      const siswaId = Auth.getSiswaId();
      const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;

      if (!siswaId && !namaSiswa) {
        document.getElementById("tagihan-ortu-list").innerHTML = `
                    <div class="card" style="background:var(--warning-light)">
                        <p class="text-sm" style="color:var(--warning)">
                            ⚠️ Akun Anda belum dihubungkan ke data siswa.
                            Silakan hubungi admin sekolah.
                        </p>
                    </div>
                `;
      } else {
        Helpers.emptyState("tagihan-ortu-list", "📄", "Belum ada tagihan SPP");
      }
      return;
    }

    const container = document.getElementById("tagihan-ortu-list");
    container.innerHTML = tagihan
      .map(
        (t) => `
            <div class="list-item" onclick="Router.go('detail-tagihan', '${t.id}')">
                <div class="list-item-left">
                    <div class="list-item-title">SPP ${Helpers.periodeLabel(t.periode)}</div>
                    <div class="list-item-subtitle">Jatuh tempo: ${t.jatuhTempo || "-"}</div>
                </div>
                <div class="list-item-right">
                    <div class="list-item-amount">${Helpers.rupiah(t.nominal)}</div>
                    ${Helpers.badge(t.status)}
                </div>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error(err);
    Helpers.errorState(
      "tagihan-ortu-list",
      "Gagal memuat tagihan: " + err.message,
    );
  }
}
