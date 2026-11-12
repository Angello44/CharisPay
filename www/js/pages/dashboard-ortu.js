/* ============================================================
   Dashboard Orang Tua
   ============================================================ */

Router.register("dashboard-ortu", {
  title: "Beranda",
  nav: true,
  requireAuth: true,
  role: "ortu",
  action: "Auth.logout()",
  actionIcon: "⏻",

  render() {
    const nama = (Auth.profile && Auth.profile.nama) || "Orang Tua";
    const namaSiswa = (Auth.profile && Auth.profile.namaSiswa) || "";

    return `
            <div class="profile-header">
                <div class="profile-avatar">${nama.charAt(0).toUpperCase()}</div>
                <div class="profile-name">${nama}</div>
                <div class="profile-email">${namaSiswa ? "Siswa: " + namaSiswa : Auth.user ? Auth.user.email : ""}</div>
            </div>

            <div class="summary-grid" id="summary-dashboard-ortu">
                <div class="summary-card primary"><div class="summary-number">-</div><div class="summary-label">Total Tagihan</div></div>
                <div class="summary-card warning"><div class="summary-number">-</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">-</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">-</div><div class="summary-label">Lunas</div></div>
            </div>

            <div class="section-title">Tagihan Terbaru</div>
            <div id="dashboard-tagihan-terbaru"><div class="loading">Memuat tagihan...</div></div>
        `;
  },

  async init() {
    await loadDashboardOrtu();
  },
});

async function loadDashboardOrtu() {
  try {
    const uid = Auth.getUid();
    const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;

    let tagihan = [];

    // Coba cari berdasarkan relasi ortu-siswa
    const siswaSnap = await db
      .collection("siswa")
      .where("ortuId", "==", uid)
      .get();

    if (!siswaSnap.empty) {
      const siswaIds = siswaSnap.docs.map((d) => d.id);
      for (let i = 0; i < siswaIds.length; i += 10) {
        const batch = siswaIds.slice(i, i + 10);
        const snap = await db
          .collection("tagihan")
          .where("siswaId", "in", batch)
          .get();
        tagihan = tagihan.concat(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        );
      }
    } else if (namaSiswa) {
      // Fallback: pakai namaSiswa dari profil
      const snap = await db
        .collection("tagihan")
        .where("namaSiswa", "==", namaSiswa)
        .get();
      tagihan = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    // Urutkan client-side: terbaru dulu
    tagihan.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    // Hitung summary
    const counts = { total: tagihan.length, belum: 0, menunggu: 0, lunas: 0 };
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

    // Update summary cards
    const summaryEl = document.getElementById("summary-dashboard-ortu");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card primary"><div class="summary-number">${counts.total}</div><div class="summary-label">Total Tagihan</div></div>
                <div class="summary-card warning"><div class="summary-number">${counts.belum}</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">${counts.menunggu}</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">${counts.lunas}</div><div class="summary-label">Lunas</div></div>
            `;
    }

    // Tampilkan 3 tagihan terbaru
    const container = document.getElementById("dashboard-tagihan-terbaru");
    if (!container) return;

    if (tagihan.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-text">Belum ada tagihan SPP</div>
                </div>
            `;
      return;
    }

    const terbaru = tagihan.slice(0, 3);
    container.innerHTML =
      terbaru
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
        .join("") +
      (tagihan.length > 3
        ? `
            <button class="btn btn-outline mt-8" onclick="Router.go('tagihan')">
                Lihat Semua Tagihan (${tagihan.length})
            </button>
        `
        : "");
  } catch (err) {
    console.error(err);
    Helpers.errorState(
      "dashboard-tagihan-terbaru",
      "Gagal memuat: " + err.message,
    );
  }
}
