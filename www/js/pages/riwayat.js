/* ============================================================
   Halaman Riwayat Pembayaran (Orang Tua - Multi Anak Support)
   ============================================================ */

Router.register("riwayat", {
  title: "Riwayat Transaksi",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
      <!-- Filter Tab Anak (Multi-Anak Switcher) -->
      <div id="riwayat-anak-filter-container"></div>

      <!-- Container Daftar Transaksi -->
      <div id="riwayat-list"><div class="loading">Memuat riwayat pembayaran...</div></div>
    `;
  },

  async init() {
    await loadRiwayat();
  },
});

let _riwayatCached = [];
let _riwayatSiswaList = [];
let _activeRiwayatAnakFilter = "semua";

async function loadRiwayat() {
  Helpers.loading("riwayat-list");
  try {
    const uid = Auth.getUid();
    const siswaList = await getSiswaOrtu();
    _riwayatSiswaList = siswaList;
    const allSiswaIds = siswaList.map((s) => s.id);

    // Ambil transaksi berdasarkan UID orang tua
    const snapUid = await db
      .collection("transaksi")
      .where("uid", "==", uid)
      .get();

    const transaksiMap = new Map();
    snapUid.docs.forEach((d) => transaksiMap.set(d.id, { id: d.id, ...d.data() }));

    // Ambil juga transaksi berdasarkan siswaId milik ortu (agar mencakup pembayaran tunai)
    if (allSiswaIds.length > 0) {
      for (let i = 0; i < allSiswaIds.length; i += 10) {
        const batch = allSiswaIds.slice(i, i + 10);
        const snapSiswa = await db
          .collection("transaksi")
          .where("siswaId", "in", batch)
          .get();

        snapSiswa.docs.forEach((d) =>
          transaksiMap.set(d.id, { id: d.id, ...d.data() }),
        );
      }
    }

    _riwayatCached = Array.from(transaksiMap.values());
    _riwayatCached.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    renderRiwayatAnakFilterTabs();
    renderRiwayatList();
  } catch (err) {
    console.error("Gagal load riwayat:", err);
    Helpers.errorState("riwayat-list", "Gagal memuat: " + err.message);
  }
}

function renderRiwayatAnakFilterTabs() {
  const container = document.getElementById("riwayat-anak-filter-container");
  if (!container) return;

  if (!_riwayatSiswaList || _riwayatSiswaList.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="filter-tabs" style="margin-bottom:12px">
      <div class="filter-chip ${_activeRiwayatAnakFilter === "semua" ? "active" : ""}"
           onclick="pilihFilterRiwayatAnak('semua', this)">
        Semua Anak (${_riwayatSiswaList.length})
      </div>
      ${_riwayatSiswaList
        .map(
          (s) => `
        <div class="filter-chip ${_activeRiwayatAnakFilter === s.id ? "active" : ""}"
             onclick="pilihFilterRiwayatAnak('${s.id}', this)">
          ${s.nama} (${s.kelas || "-"})
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function pilihFilterRiwayatAnak(siswaId, el) {
  _activeRiwayatAnakFilter = siswaId;
  if (el) {
    const parent = el.parentElement;
    parent.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  }
  renderRiwayatList();
}

function renderRiwayatList() {
  const container = document.getElementById("riwayat-list");
  if (!container) return;

  let filtered = _riwayatCached;
  if (_activeRiwayatAnakFilter !== "semua") {
    filtered = _riwayatCached.filter((t) => t.siswaId === _activeRiwayatAnakFilter);
  }

  if (filtered.length === 0) {
    Helpers.emptyState(
      "riwayat-list",
      Icons.receipt,
      "Belum ada riwayat transaksi yang tercatat untuk filter ini.",
    );
    return;
  }

  container.innerHTML = `
    <div class="section-title mb-12">Semua Transaksi (${filtered.length})</div>
    ${filtered
      .map((t) => {
        const metodeLabel =
          t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank BCA";
        const tanggal = Helpers.tanggal(t.createdAt);
        const isLunas = t.status === "lunas";

        return `
          <div class="bill-card" onclick="showDetailRiwayat('${t.id}')">
            <div class="bill-card-left">
              <div class="bill-icon-box" style="${isLunas ? "background:#dcfce7;color:#16a34a" : ""}">
                ${isLunas ? Icons.checkCircle : Icons.receipt}
              </div>
              <div class="bill-card-info">
                <div class="bill-card-title">${t.jenisTagihan || "SPP"} &bull; ${Helpers.periodeLabel(t.periode)}</div>
                <div class="bill-card-meta">
                  <span class="badge" style="background:#eff6ff;color:var(--primary);font-size:10px;padding:1px 6px;font-weight:700;border:1px solid #bfdbfe">${t.jenisTagihan || "SPP"}</span>
                  <span class="font-semibold" style="color:var(--text)">${t.namaSiswa || "Siswa"}</span>
                  ${t.kelas ? `<span>&bull;</span><span>${t.kelas}</span>` : ""}
                  <span>&bull;</span>
                  <span>${metodeLabel}</span>
                  <span>&bull;</span>
                  <span>${tanggal}</span>
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
      .join("")}
  `;
}

async function showDetailRiwayat(id) {
  try {
    const doc = await db.collection("transaksi").doc(id).get();
    if (!doc.exists) return;
    const t = { id: doc.id, ...doc.data() };

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-riwayat-detail";
    overlay.innerHTML = `
      <div class="modal" style="max-height:92vh;overflow-y:auto;padding:20px">
        <div class="invoice-header" style="border-bottom:2px dashed var(--border);padding-bottom:12px;margin-bottom:14px;text-align:center">
          <div class="empty-state-icon" style="color:var(--primary);background:var(--primary-light);margin-bottom:6px">${Icons.receipt}</div>
          <div class="font-bold text-sm" style="color:var(--text)">Kwitansi Pembayaran</div>
          <div class="text-xs text-secondary">CharisPay &bull; ID: ${t.id.substring(0, 8).toUpperCase()}</div>
        </div>

        <div class="card-row">
          <span class="card-label">Status Verifikasi</span>
          <span>${Helpers.badge(t.status)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Jenis Tagihan</span>
          <span class="card-value font-bold" style="color:var(--primary)">${t.jenisTagihan || "SPP"}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Siswa</span>
          <span class="card-value font-bold">${t.namaSiswa || "-"} (${t.kelas || "-"})</span>
        </div>
        <div class="card-row">
          <span class="card-label">Periode</span>
          <span class="card-value">${Helpers.periodeLabel(t.periode)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Total Dibayar</span>
          <span class="card-value font-bold" style="color:var(--primary);font-size:15px">${Helpers.rupiah(t.nominal)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Metode</span>
          <span class="card-value">${t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank BCA"}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Waktu Transaksi</span>
          <span class="card-value">${Helpers.tanggal(t.createdAt)}</span>
        </div>

        ${
          t.catatan
            ? `
          <div class="card" style="background:#fffbeb;border-color:#fde68a;margin-top:10px;padding:10px">
            <div class="text-xs font-bold" style="color:#b45309">Catatan Petugas:</div>
            <div class="text-xs text-secondary mt-2">${t.catatan}</div>
          </div>
        `
            : ""
        }

        ${
          t.status === "lunas"
            ? `
          <button class="btn btn-primary mt-14 w-full" onclick="downloadStrukPDF('${t.id}')">
            ${Icons.receipt} Unduh Struk Bukti Pembayaran (PDF)
          </button>
        `
            : ""
        }

        ${
          t.buktiUrl
            ? `
          <div style="margin:16px 0;text-align:center">
            <div class="text-xs font-bold text-secondary mb-8">Berkas Bukti Transfer:</div>
            ${
              t.buktiTipe === "application/pdf"
                ? `<a href="${t.buktiUrl}" target="_blank" class="btn btn-outline btn-sm">${Icons.fileText} Buka Dokumen PDF</a>`
                : `<img src="${t.buktiUrl}" style="max-width:100%;max-height:220px;border-radius:10px;border:1px solid var(--border);box-shadow:var(--shadow-sm)" alt="Bukti Transfer">`
            }
          </div>
        `
            : ""
        }

        <button class="btn btn-secondary mt-12 w-full" onclick="document.getElementById('modal-riwayat-detail').remove()">
          Tutup
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (err) {
    console.error(err);
  }
}

/* ============================================================
   Download Struk PDF untuk Orang Tua (jsPDF)
   ============================================================ */

function getLogoDataUrl() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = function () {
      resolve(null);
    };
    img.src = "img/logo.png";
  });
}

async function downloadStrukPDF(transaksiId) {
  if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
    Router.toast("Library PDF sedang dimuat. Silakan periksa koneksi internet.");
    return;
  }

  Router.toast("Membuat dokumen struk pembayaran...");

  try {
    const docSnap = await db.collection("transaksi").doc(transaksiId).get();
    if (!docSnap.exists) {
      Router.toast("Data transaksi tidak ditemukan");
      return;
    }
    const t = { id: docSnap.id, ...docSnap.data() };

    const { jsPDF } = window.jspdf;
    // Format A5 portrait: 148 mm x 210 mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    // 1. Logo CharisPay
    const logoDataUrl = await getLogoDataUrl();
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", 14, 12, 16, 16);
      } catch (e) {
        console.warn("Logo addImage fallback:", e);
      }
    }

    // 2. Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(37, 99, 235); // var(--primary)
    doc.text("CHARISPAY", 33, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Charis National Academy / Institute • Bukti Pembayaran Resmi", 33, 23);

    // Garis Pemisah Header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 32, 134, 32);

    // 3. Judul Struk
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("BUKTI PEMBAYARAN SPP", 74, 40, { align: "center" });

    // Nomor Transaksi (8 karakter pertama ID Firestore)
    const idTx = t.id.substring(0, 8).toUpperCase();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Nomor Transaksi: #${idTx}`, 74, 44.5, { align: "center" });

    // 4. Status LUNAS
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(52, 48, 44, 7, 2, 2, "FD");
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("STATUS: LUNAS", 74, 52.8, { align: "center" });

    // 5. Kotak Detail Transaksi
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 59, 120, 68, 3, 3, "FD");

    const tglBayar =
      t.tanggal || (t.createdAt ? Helpers.tanggal(t.createdAt) : "-");
    const metode =
      t.metode === "tunai" ? "Tunai di Sekolah" : "Transfer Bank BCA";
    const jenisTagihan = t.jenisTagihan || "SPP";

    const fields = [
      ["Nama Siswa", t.namaSiswa || "-"],
      ["NIS", t.nis || "-"],
      ["Kelas", t.kelas || "-"],
      ["Jenis Tagihan", jenisTagihan],
      ["Periode", Helpers.periodeLabel(t.periode)],
      ["Metode Bayar", metode],
      ["Tanggal Bayar", tglBayar],
    ];

    let startY = 67;
    fields.forEach(([label, val]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 20, startY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(val), 128, startY, { align: "right" });

      doc.setDrawColor(241, 245, 249);
      doc.line(20, startY + 2, 128, startY + 2);

      startY += 8;
    });

    // 6. Kotak Total Nominal
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, 132, 120, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text("Total Pembayaran Lunas:", 19, 141);
    doc.text(Helpers.rupiah(t.nominal), 128, 141, { align: "right" });

    // 7. Area Tanda Tangan & Verifikasi Digital Admin
    const adminVerif =
      t.verifiedByNama ||
      (Auth.profile && Auth.profile.nama) ||
      "Petugas Keuangan CharisPay";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Diverifikasi Resmi Oleh:", 100, 153, { align: "center" });

    // Stempel Digital
    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(240, 246, 255);
    doc.roundedRect(77, 156, 46, 17, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(37, 99, 235);
    doc.text("VERIFIKASI DIGITAL", 100, 161.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("CHARISPAY SYSTEM", 100, 165.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text("VALID & VERIFIED", 100, 170, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(adminVerif, 100, 179, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Bagian Administrasi & Keuangan", 100, 183, { align: "center" });

    // 8. Footer Catatan
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Kwitansi ini adalah bukti pembayaran elektronik yang sah diterbitkan oleh CharisPay.",
      74,
      198,
      { align: "center" },
    );

    // 9. Simpan File sebagai struk-[namaSiswa]-[periode].pdf
    const namaSiswaClean = (t.namaSiswa || "siswa")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const periodeClean = (t.periode || "periode").replace(/[^a-z0-9]/g, "-");
    const filename = `struk-${namaSiswaClean}-${periodeClean}.pdf`;

    doc.save(filename);
    Router.toast(`Struk berhasil diunduh: ${filename}`);
  } catch (err) {
    console.error("Download struk PDF error:", err);
    Router.toast("Gagal mengunduh struk: " + err.message);
  }
}
