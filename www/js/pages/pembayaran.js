/* ============================================================
   Halaman Pembayaran Transfer (Orang Tua)
   ============================================================ */

Router.register("pembayaran", {
  title: "Pembayaran",
  back: true,
  backTo: "tagihan",
  nav: false,
  requireAuth: true,
  role: "ortu",

  render(params) {
    return `<div id="pembayaran-content"><div class="loading">Memuat data...</div></div>`;
  },

  async init(params) {
    const tagihanId = params[0];
    if (!tagihanId) {
      Router.go("tagihan");
      return;
    }

    try {
      const doc = await db.collection("tagihan").doc(tagihanId).get();
      if (!doc.exists) {
        Helpers.errorState("pembayaran-content", "Tagihan tidak ditemukan");
        return;
      }

      const tagihan = { id: doc.id, ...doc.data() };

      // Cek status — hanya boleh bayar kalau belum/revisi/ditolak
      if (tagihan.status === "lunas") {
        document.getElementById("pembayaran-content").innerHTML = `
                    <div class="card" style="background:var(--success-light)">
                        <p class="text-sm" style="color:var(--success)">✅ Tagihan ini sudah lunas.</p>
                    </div>
                    <button class="btn btn-secondary mt-16" onclick="Router.go('tagihan')">Kembali</button>
                `;
        return;
      }

      if (tagihan.status === "menunggu") {
        document.getElementById("pembayaran-content").innerHTML = `
                    <div class="card" style="background:var(--info-light)">
                        <p class="text-sm" style="color:var(--info)">⏳ Bukti transfer sudah dikirim, sedang menunggu verifikasi admin.</p>
                    </div>
                    <button class="btn btn-secondary mt-16" onclick="Router.go('tagihan')">Kembali</button>
                `;
        return;
      }

      // Tampilkan form pembayaran
      document.getElementById("pembayaran-content").innerHTML = `
                <div class="card">
                    <div class="card-title">Informasi Tagihan</div>
                    <div class="card-row">
                        <span class="card-label">Nama Siswa</span>
                        <span class="card-value">${tagihan.namaSiswa || "-"}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Periode</span>
                        <span class="card-value">SPP ${Helpers.periodeLabel(tagihan.periode)}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Nominal</span>
                        <span class="card-value font-semibold" style="color:var(--primary)">${Helpers.rupiah(tagihan.nominal)}</span>
                    </div>
                    ${
                      tagihan.status === "revisi"
                        ? `
                    <div class="card-row">
                        <span class="card-label">Status</span>
                        ${Helpers.badge(tagihan.status)}
                    </div>`
                        : ""
                    }
                </div>

                <div class="form-group">
                    <label>Metode Pembayaran</label>
                    <select id="metode-bayar">
                        <option value="transfer">Transfer Bank</option>
                        <option value="tunai">Tunai (di sekolah)</option>
                    </select>
                </div>

                <!-- Info rekening transfer -->
                <div id="section-transfer">
                    <div class="card" style="background:var(--primary-light)">
                        <div class="card-title">Transfer ke Rekening Sekolah</div>
                        <div class="card-row">
                            <span class="card-label">Bank</span>
                            <span class="card-value">BCA</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">No. Rekening</span>
                            <span class="card-value font-semibold">1234567890</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Atas Nama</span>
                            <span class="card-value">Charis Institute</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Jumlah</span>
                            <span class="card-value font-semibold">${Helpers.rupiah(tagihan.nominal)}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Upload Bukti Transfer</label>
                        <div class="upload-area" id="upload-area" onclick="document.getElementById('file-bukti').click()">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text" id="upload-text">Tap untuk pilih foto / file</div>
                            <div class="upload-hint">Format: JPG, PNG, atau PDF (maks. 5MB)</div>
                        </div>
                        <input type="file" id="file-bukti"
                               accept="image/jpeg,image/png,application/pdf"
                               style="display:none">
                    </div>

                    <!-- Preview gambar yang dipilih -->
                    <div id="preview-bukti" style="display:none;margin-bottom:16px;text-align:center">
                        <img id="preview-img"
                             style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)"
                             alt="Preview">
                        <p id="preview-pdf" class="text-sm text-secondary" style="display:none"></p>
                    </div>
                </div>

                <!-- Info tunai -->
                <div id="section-tunai" style="display:none">
                    <div class="card" style="background:var(--warning-light)">
                        <p class="text-sm" style="color:var(--warning)">
                            💰 Silakan datang ke sekolah dan bayar ke petugas keuangan.
                            Admin akan mencatat pembayaran setelah diterima.
                        </p>
                    </div>
                </div>

                <div id="error-pembayaran" class="form-error" style="margin-bottom:12px"></div>

                <button class="btn btn-primary" id="btn-kirim-bayar" onclick="kirimPembayaran('${tagihanId}')">
                    Kirim Bukti Transfer
                </button>
            `;

      // Event toggle metode
      document
        .getElementById("metode-bayar")
        .addEventListener("change", function () {
          const isTransfer = this.value === "transfer";
          document.getElementById("section-transfer").style.display = isTransfer
            ? "block"
            : "none";
          document.getElementById("section-tunai").style.display = isTransfer
            ? "none"
            : "block";
          const btn = document.getElementById("btn-kirim-bayar");
          btn.textContent = isTransfer
            ? "Kirim Bukti Transfer"
            : "Informasi Diterima";
        });

      // Event file input — tampilkan preview
      document
        .getElementById("file-bukti")
        .addEventListener("change", function () {
          const file = this.files[0];
          if (!file) return;

          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            document.getElementById("error-pembayaran").textContent =
              "Ukuran file maksimal 5MB";
            this.value = "";
            return;
          }

          document.getElementById("upload-text").textContent = file.name;
          document.getElementById("preview-bukti").style.display = "block";

          if (file.type === "application/pdf") {
            document.getElementById("preview-img").style.display = "none";
            document.getElementById("preview-pdf").style.display = "block";
            document.getElementById("preview-pdf").textContent =
              "📄 " + file.name;
          } else {
            document.getElementById("preview-img").style.display = "block";
            document.getElementById("preview-pdf").style.display = "none";
            const reader = new FileReader();
            reader.onload = (e) => {
              document.getElementById("preview-img").src = e.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
    } catch (err) {
      console.error(err);
      Helpers.errorState("pembayaran-content", "Gagal memuat: " + err.message);
    }
  },
});

async function kirimPembayaran(tagihanId) {
  const metode = document.getElementById("metode-bayar").value;
  const errEl = document.getElementById("error-pembayaran");
  errEl.textContent = "";

  // Kalau tunai — tidak perlu upload, cukup info
  if (metode === "tunai") {
    document.getElementById("pembayaran-content").innerHTML = `
            <div class="card" style="background:var(--success-light)">
                <p class="text-sm" style="color:var(--success)">
                    ✅ Informasi diterima. Silakan datang ke sekolah untuk melakukan pembayaran tunai.
                    Admin akan mencatat pembayaran setelah diterima.
                </p>
            </div>
            <button class="btn btn-secondary mt-16" onclick="Router.go('tagihan')">Kembali ke Tagihan</button>
        `;
    return;
  }

  // Validasi file
  const fileInput = document.getElementById("file-bukti");
  if (!fileInput.files.length) {
    errEl.textContent = "Silakan pilih file bukti transfer terlebih dahulu";
    return;
  }

  const file = fileInput.files[0];
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    errEl.textContent =
      "Format file tidak didukung. Gunakan JPG, PNG, atau PDF";
    return;
  }

  Helpers.btnLoading("btn-kirim-bayar", "Mengupload...");

  try {
    // 1. Upload bukti ke Firebase Storage
    const uid = Auth.getUid();
    const ext = file.name.split(".").pop();
    const fileName = `bukti-transfer/${uid}/${tagihanId}_${Date.now()}.${ext}`;
    const storageRef = storage.ref(fileName);

    const uploadTask = await storageRef.put(file);
    const buktiUrl = await uploadTask.ref.getDownloadURL();

    // 2. Ambil data tagihan untuk disimpan di transaksi
    const tagihanDoc = await db.collection("tagihan").doc(tagihanId).get();
    const tagihan = tagihanDoc.data();

    // 3. Simpan transaksi ke Firestore
    await db.collection("transaksi").add({
      tagihanId,
      siswaId: tagihan.siswaId || "",
      namaSiswa: tagihan.namaSiswa || "",
      kelas: tagihan.kelas || "",
      periode: tagihan.periode,
      nominal: tagihan.nominal,
      metode: "transfer",
      buktiUrl,
      buktiTipe: file.type,
      status: "menunggu",
      uid: Auth.getUid(),
      catatan: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // 4. Update status tagihan → menunggu verifikasi
    await db.collection("tagihan").doc(tagihanId).update({
      status: "menunggu",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // 5. Tampilkan pesan sukses
    Router.toast("Bukti transfer berhasil dikirim. Menunggu verifikasi admin.");
    Router.go("riwayat");
  } catch (err) {
    console.error(err);
    errEl.textContent = "Gagal upload: " + err.message;
    Helpers.btnReset("btn-kirim-bayar");
  }
}
