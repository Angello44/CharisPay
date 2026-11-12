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
    await loadTagihanOrtu();
  },
});

async function loadTagihanOrtu() {
  Helpers.loading("tagihan-ortu-list");
  try {
    // Ambil semua siswa milik ortu ini
    // Asumsi: koleksi siswa yang ditautkan ke UID ortu
    // Untuk sementara, tampilkan semua tagihan yang namaSiswa-nya ada di profil ortu
    // Nanti bisa difilter berdasarkan siswaId setelah relasi ortu-siswa dibuat

    const uid = Auth.getUid();

    // Ambil tagihan berdasarkan siswaId yang terdaftar ke akun ortu ini
    // Pertama cari siswa yang terkait dengan ortu ini
    const siswaSnap = await db
      .collection("siswa")
      .where("ortuId", "==", uid)
      .get();

    let tagihan = [];

    if (!siswaSnap.empty) {
      // Kalau sudah ada relasi ortu-siswa, ambil tagihan per siswa
      const siswaIds = siswaSnap.docs.map((d) => d.id);

      // Firestore 'in' max 10 item per query
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
    } else {
      const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;
      if (namaSiswa) {
        const snap = await db
          .collection("tagihan")
          .where("namaSiswa", "==", namaSiswa)
          .get();
        tagihan = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    }

    // Urutkan client-side: terbaru dulu
    tagihan.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    // Hitung summary
    const counts = { belum: 0, menunggu: 0, lunas: 0, total: tagihan.length };
    tagihan.forEach((t) => {
      if (t.status === "belum" || t.status === "revisi") counts.belum++;
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
      Helpers.emptyState("tagihan-ortu-list", "📄", "Belum ada tagihan SPP");
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
