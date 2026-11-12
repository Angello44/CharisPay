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
    const siswaIds = Auth.getSiswaIds();
    const infoAnak =
      siswaIds.length > 0
        ? siswaIds.length + " anak terdaftar"
        : Auth.user
          ? Auth.user.email
          : "";

    return `
            <div class="profile-header">
                <div class="profile-avatar">${nama.charAt(0).toUpperCase()}</div>
                <div class="profile-name">${nama}</div>
                <div class="profile-email" id="info-anak-header">${infoAnak}</div>
            </div>

            <!-- Daftar anak yang sudah terhubung -->
            <div id="daftar-anak-section"></div>

            <div class="summary-grid" id="summary-dashboard-ortu">
                <div class="summary-card primary"><div class="summary-number">-</div><div class="summary-label">Total Tagihan</div></div>
                <div class="summary-card warning"><div class="summary-number">-</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">-</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">-</div><div class="summary-label">Lunas</div></div>
            </div>

            <div class="section-title">Tagihan Terbaru</div>
            <div id="dashboard-tagihan-terbaru"><div class="loading">Memuat tagihan...</div></div>

            <div class="flex gap-8 mt-16">
                <button class="btn btn-outline" style="flex:1" onclick="Router.go('nilai-ortu')">
                    📊 Nilai Anak
                </button>
                <button class="btn btn-outline" style="flex:1" onclick="Router.go('panduan')">
                    ❓ Bantuan
                </button>
            </div>

            <!-- Modal Tambah Anak -->
            <div id="modal-tambah-anak" class="modal-overlay hidden">
                <div class="modal" style="max-height:90vh;overflow-y:auto">
                    <div class="modal-title">Tambah Data Anak</div>
                    <p class="text-sm text-secondary mb-16">
                        Masukkan Nama atau NIS anak Anda untuk mencari data di sistem.
                    </p>

                    <div class="form-group">
                        <label>Cari dengan Nama atau NIS</label>
                        <div style="display:flex;gap:8px">
                            <input type="text" id="input-cari-anak"
                                   placeholder="cth: Budi Santoso atau NIS 2024001"
                                   style="flex:1"
                                   onkeydown="if(event.key==='Enter') cariSiswaOrtu()">
                            <button class="btn btn-primary btn-sm"
                                    style="white-space:nowrap"
                                    onclick="cariSiswaOrtu()">Cari</button>
                        </div>
                        <div class="form-hint">Masukkan nama lengkap atau Nomor Induk Siswa (NIS)</div>
                    </div>

                    <!-- Hasil pencarian -->
                    <div id="hasil-cari-anak"></div>

                    <button class="btn btn-secondary mt-8" onclick="tutupModalTambahAnak()">
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

/* ============================================================
   Load Dashboard Ortu
   ============================================================ */

async function loadDashboardOrtu() {
  try {
    const siswaList = await getSiswaOrtu();

    // Update info anak di header
    const infoEl = document.getElementById("info-anak-header");
    if (infoEl) {
      infoEl.textContent =
        siswaList.length > 0
          ? "Siswa: " + siswaList.map((s) => s.nama).join(", ")
          : Auth.user
            ? Auth.user.email
            : "";
    }

    // Render daftar anak
    renderDaftarAnak(siswaList);

    // Ambil tagihan
    const tagihan = await getTagihanOrtu();

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

    const summaryEl = document.getElementById("summary-dashboard-ortu");
    if (summaryEl) {
      summaryEl.innerHTML = `
                <div class="summary-card primary"><div class="summary-number">${counts.total}</div><div class="summary-label">Total Tagihan</div></div>
                <div class="summary-card warning"><div class="summary-number">${counts.belum}</div><div class="summary-label">Belum Bayar</div></div>
                <div class="summary-card info"><div class="summary-number">${counts.menunggu}</div><div class="summary-label">Menunggu</div></div>
                <div class="summary-card success"><div class="summary-number">${counts.lunas}</div><div class="summary-label">Lunas</div></div>
            `;
    }

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
                    <div class="list-item-subtitle">
                        ${t.namaSiswa || ""} &middot; Jatuh tempo: ${t.jatuhTempo || "-"}
                    </div>
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

/* ============================================================
   Render Daftar Anak
   ============================================================ */

function renderDaftarAnak(siswaList) {
  const section = document.getElementById("daftar-anak-section");
  if (!section) return;

  let html = `
        <div class="flex justify-between items-center" style="margin-bottom:8px">
            <div class="section-title" style="margin:0">Data Anak</div>
            <button class="btn btn-primary btn-sm" onclick="showModalTambahAnak()">
                + Tambah Anak
            </button>
        </div>
    `;

  if (siswaList.length === 0) {
    html += `
            <div class="card" style="background:var(--warning-light);margin-bottom:12px">
                <p class="text-sm" style="color:var(--warning)">
                    ⚠️ Belum ada data anak yang terhubung.<br>
                    Tap <strong>"+ Tambah Anak"</strong> dan masukkan Nama atau NIS anak Anda.
                </p>
            </div>
        `;
  } else {
    html += siswaList
      .map((s) => {
        return `
                <div class="card" style="margin-bottom:8px;padding:12px">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="font-semibold">${s.nama}</div>
                            <div class="text-sm text-secondary">
                                ${s.kelas} &middot; NIS: ${s.nis || "-"}
                            </div>
                            <div class="text-sm" style="color:var(--success);margin-top:2px">
                                👩‍🏫 Wali: <span id="wali-${s.id}">Memuat...</span>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm"
                                onclick="lepasAnak('${s.id}', '${s.nama}')">
                            Lepas
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  section.innerHTML = html;

  // Load wali kelas untuk tiap anak
  siswaList.forEach(async (s) => {
    const wali = await getWaliByKelas(s.kelas);
    const el = document.getElementById("wali-" + s.id);
    if (el) el.textContent = wali ? wali.namaWali : "Belum diatur";
  });
}

/* ============================================================
   Modal Tambah Anak — Cari Siswa pakai Nama atau NIS
   ============================================================ */

function showModalTambahAnak() {
  document.getElementById("input-cari-anak").value = "";
  document.getElementById("hasil-cari-anak").innerHTML = "";
  document.getElementById("modal-tambah-anak").classList.remove("hidden");
}

function tutupModalTambahAnak() {
  document.getElementById("modal-tambah-anak").classList.add("hidden");
}

async function cariSiswaOrtu() {
  const keyword = document.getElementById("input-cari-anak").value.trim();
  const hasilEl = document.getElementById("hasil-cari-anak");

  if (!keyword) {
    hasilEl.innerHTML = `<div class="form-error">Masukkan nama atau NIS terlebih dahulu</div>`;
    return;
  }

  hasilEl.innerHTML = `<div class="loading">Mencari data...</div>`;

  try {
    // Cari berdasarkan NIS (exact match lebih akurat)
    const nisSap = await db
      .collection("siswa")
      .where("nis", "==", keyword)
      .get();

    // Cari berdasarkan nama (case-sensitive di Firestore)
    // Pakai range query untuk partial match
    const namaSnap = await db
      .collection("siswa")
      .where("nama", ">=", keyword)
      .where("nama", "<=", keyword + "\uf8ff")
      .get();

    // Gabungkan hasil, hilangkan duplikat
    const semuaDoc = [...nisSap.docs];
    namaSnap.docs.forEach((d) => {
      if (!semuaDoc.find((x) => x.id === d.id)) semuaDoc.push(d);
    });

    if (semuaDoc.length === 0) {
      hasilEl.innerHTML = `
                <div class="card" style="background:var(--danger-light)">
                    <p class="text-sm" style="color:var(--danger)">
                        ❌ Data siswa tidak ditemukan.<br>
                        Pastikan nama atau NIS yang dimasukkan sudah benar,
                        atau hubungi admin sekolah.
                    </p>
                </div>
            `;
      return;
    }

    // Cek siswa yang sudah terhubung ke ortu ini
    const siswaIds = Auth.getSiswaIds();

    let html = `<div class="text-sm text-secondary mb-8">Ditemukan ${semuaDoc.length} data:</div>`;

    for (const doc of semuaDoc) {
      const s = { id: doc.id, ...doc.data() };
      const sudahTerhubung = siswaIds.includes(s.id);

      // Ambil wali kelas
      const wali = await getWaliByKelas(s.kelas);

      // Cek apakah siswa sudah terhubung ke ortu lain
      const sudahAdaOrtu = s.ortuId && s.ortuId !== Auth.getUid();

      html += `
                <div class="card" style="margin-bottom:10px">
                    <div class="card-row">
                        <span class="card-label">Nama</span>
                        <span class="card-value font-semibold">${s.nama}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">NIS</span>
                        <span class="card-value">${s.nis || "-"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Kelas</span>
                        <span class="card-value">${s.kelas || "-"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Wali Kelas</span>
                        <span class="card-value">${wali ? wali.namaWali : "-"}</span>
                    </div>
                    ${
                      sudahTerhubung
                        ? `
                        <div class="card" style="background:var(--success-light);margin-top:8px">
                            <p class="text-sm" style="color:var(--success)">✅ Sudah terhubung ke akun Anda</p>
                        </div>
                    `
                        : sudahAdaOrtu
                          ? `
                        <div class="card" style="background:var(--warning-light);margin-top:8px">
                            <p class="text-sm" style="color:var(--warning)">
                                ⚠️ Siswa ini sudah terhubung ke akun lain.
                                Hubungi admin jika ada kesalahan.
                            </p>
                        </div>
                    `
                          : `
                        <button class="btn btn-primary mt-8"
                                onclick="hubungkanAnak('${s.id}', '${s.nama}', '${s.kelas}')">
                            ✓ Ya, ini anak saya — Hubungkan
                        </button>
                    `
                    }
                </div>
            `;
    }

    hasilEl.innerHTML = html;
  } catch (err) {
    console.error(err);
    hasilEl.innerHTML = `<div class="form-error">Gagal mencari: ${err.message}</div>`;
  }
}

async function hubungkanAnak(siswaId, namaSiswa, kelas) {
  try {
    const uid = Auth.getUid();

    // Update dokumen siswa — tambah ortuId
    await db
      .collection("siswa")
      .doc(siswaId)
      .update({
        ortuId: uid,
        ortuNama: Auth.profile ? Auth.profile.nama : "",
        ortuEmail: Auth.user ? Auth.user.email : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Update profil ortu — tambah siswaId ke array
    const siswaIds = Auth.getSiswaIds();
    if (!siswaIds.includes(siswaId)) siswaIds.push(siswaId);
    Auth.profile.siswaIds = siswaIds;

    await db.collection("users").doc(uid).update({ siswaIds });

    Router.toast(`✅ ${namaSiswa} berhasil ditambahkan`);
    tutupModalTambahAnak();

    // Refresh dashboard
    await loadDashboardOrtu();
  } catch (err) {
    Router.toast("Gagal menghubungkan: " + err.message);
  }
}

async function lepasAnak(siswaId, namaSiswa) {
  const ok = await Helpers.confirm(
    `Lepas data "${namaSiswa}" dari akun Anda? Tagihan terkait tidak akan terhapus.`,
  );
  if (!ok) return;

  try {
    const uid = Auth.getUid();

    // Hapus ortuId dari dokumen siswa
    await db.collection("siswa").doc(siswaId).update({
      ortuId: firebase.firestore.FieldValue.delete(),
      ortuNama: firebase.firestore.FieldValue.delete(),
      ortuEmail: firebase.firestore.FieldValue.delete(),
    });

    // Hapus siswaId dari profil ortu
    const siswaIds = Auth.getSiswaIds().filter((id) => id !== siswaId);
    Auth.profile.siswaIds = siswaIds;
    await db.collection("users").doc(uid).update({ siswaIds });

    Router.toast(`${namaSiswa} berhasil dilepas`);
    await loadDashboardOrtu();
  } catch (err) {
    Router.toast("Gagal: " + err.message);
  }
}
