/* ============================================================
   Halaman Pembayaran Transfer (Orang Tua - Clean Vector UI)
   ============================================================ */

Router.register("pembayaran", {
  title: "Konfirmasi Pembayaran",
  back: true,
  backTo: "tagihan",
  nav: false,
  requireAuth: true,
  role: "ortu",

  render(params) {
    return `<div id="pembayaran-content"><div class="loading">Memuat rincian pembayaran...</div></div>`;
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

      if (tagihan.status === "lunas") {
        document.getElementById("pembayaran-content").innerHTML = `
          <div class="card" style="background:#ecfdf5;border-color:#a7f3d0;text-align:center;padding:24px">
            <div class="empty-state-icon" style="color:#10b981;background:#dcfce7;margin-bottom:8px">${Icons.checkCircle}</div>
            <div class="font-bold text-sm" style="color:#047857">Tagihan Ini Sudah Lunas</div>
            <p class="text-xs text-secondary mt-4">Terima kasih atas pembayaran Anda.</p>
            <button class="btn btn-secondary mt-16" onclick="Router.go('tagihan')">Kembali ke Tagihan</button>
          </div>
        `;
        return;
      }

      if (tagihan.status === "menunggu") {
        document.getElementById("pembayaran-content").innerHTML = `
          <div class="card" style="background:#e0f2fe;border-color:#bae6fd;text-align:center;padding:24px">
            <div class="empty-state-icon" style="color:#0284c7;background:#e0f2fe;margin-bottom:8px">${Icons.clock}</div>
            <div class="font-bold text-sm" style="color:#0369a1">Sedang Menunggu Verifikasi</div>
            <p class="text-xs text-secondary mt-4">Bukti transfer sudah dikirim dan sedang dalam pemeriksaan admin sekolah.</p>
            <button class="btn btn-secondary mt-16" onclick="Router.go('tagihan')">Kembali ke Tagihan</button>
          </div>
        `;
        return;
      }

      const norekBCA = "1234567890";
      const atasNama = "Charis Institute";

      document.getElementById("pembayaran-content").innerHTML = `
        <div class="card" style="margin-bottom:14px">
          <div class="card-title">Informasi Tagihan</div>
          <div class="card-row">
            <span class="card-label">Nama Siswa</span>
            <span class="card-value font-bold">${tagihan.namaSiswa || "-"} (${tagihan.kelas || "-"})</span>
          </div>
          <div class="card-row">
            <span class="card-label">Periode SPP</span>
            <span class="card-value font-bold">SPP ${Helpers.periodeLabel(tagihan.periode)}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Total Tagihan</span>
            <span class="card-value font-bold" style="color:var(--primary);font-size:16px">${Helpers.rupiah(tagihan.nominal)}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Metode Pembayaran</label>
          <select id="metode-bayar" style="font-weight:600">
            <option value="transfer">Transfer Bank BCA</option>
            <option value="tunai">Bayar Tunai di Sekolah</option>
          </select>
        </div>

        <div id="section-transfer">
          <div class="bank-account-card">
            <div class="bank-header">
              <span class="bank-name-badge">BANK BCA</span>
              <button class="copy-pill-btn" onclick="Helpers.copyToClipboard('${norekBCA}', 'Nomor rekening BCA disalin')">
                ${Icons.copy} Salin No. Rekening
              </button>
            </div>
            <div class="bank-rek-number">${norekBCA}</div>
            <div class="bank-owner-name">a.n. ${atasNama}</div>
            <div style="border-top:1px dashed rgba(255,255,255,0.25);padding-top:10px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:11px;opacity:0.85">Nominal Transfer:</div>
                <div style="font-size:16px;font-weight:800">${Helpers.rupiah(tagihan.nominal)}</div>
              </div>
              <button class="copy-pill-btn" onclick="Helpers.copyToClipboard('${tagihan.nominal}', 'Nominal disalin')">
                ${Icons.copy} Salin Nominal
              </button>
            </div>
          </div>

          <div class="card" style="background:#f8fafc;padding:12px;margin-bottom:14px">
            <div class="text-xs text-secondary" style="line-height:1.5">
              <strong>Petunjuk Pembayaran:</strong><br>
              1. Transfer melalui m-Banking atau ATM sesuai nominal di atas.<br>
              2. Simpan struk atau screenshot bukti transfer.<br>
              3. Unggah bukti pembayaran melalui formulir di bawah.
            </div>
          </div>

          <div class="form-group">
            <label>Unggah Bukti Transfer</label>
            <div class="upload-area" id="upload-area" onclick="document.getElementById('file-bukti').click()">
              <div class="upload-icon">${Icons.camera}</div>
              <div class="upload-text" id="upload-text">Pilih Foto Bukti Transfer</div>
              <div class="upload-hint">Foto struk ATM atau screenshot m-Banking (JPG, PNG, atau PDF)</div>
            </div>
            <input type="file" id="file-bukti" accept="image/jpeg,image/png,application/pdf" style="display:none">
          </div>

          <div id="preview-bukti" style="display:none;margin-bottom:16px;text-align:center">
            <div style="position:relative;display:inline-block">
              <img id="preview-img" style="max-width:100%;max-height:220px;border-radius:12px;border:1px solid var(--border);box-shadow:var(--shadow-sm)" alt="Preview">
              <p id="preview-pdf" class="text-sm text-secondary" style="display:none"></p>
            </div>
            <div class="mt-8">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('file-bukti').click()">
                ${Icons.refresh} Ganti Berkas
              </button>
            </div>
          </div>
        </div>

        <div id="section-tunai" style="display:none">
          <div class="card" style="background:#fffbeb;border-color:#fde68a;padding:18px">
            <div class="font-bold text-sm" style="color:#b45309;margin-bottom:6px">Pembayaran Tunai di Sekolah</div>
            <p class="text-xs text-secondary" style="line-height:1.5">
              Silakan datang langsung ke loket Bagian Keuangan Charis Institute pada hari kerja (Senin &ndash; Jumat, 08.00 &ndash; 14.00 WIB). Petugas akan mencatat dan memberikan kwitansi resmi.
            </p>
          </div>
        </div>

        <div id="error-pembayaran" class="form-error" style="margin-bottom:12px"></div>

        <button class="btn btn-primary" id="btn-kirim-bayar" onclick="kirimPembayaran('${tagihanId}')">
          Kirim Bukti Pembayaran
        </button>
      `;

      document.getElementById("metode-bayar").addEventListener("change", function () {
        const isTransfer = this.value === "transfer";
        document.getElementById("section-transfer").style.display = isTransfer ? "block" : "none";
        document.getElementById("section-tunai").style.display = isTransfer ? "none" : "block";
        const btn = document.getElementById("btn-kirim-bayar");
        btn.textContent = isTransfer ? "Kirim Bukti Pembayaran" : "Kembali ke Tagihan";
      });

      document.getElementById("file-bukti").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          document.getElementById("error-pembayaran").textContent = "Ukuran file terlalu besar, maksimal 5MB";
          this.value = "";
          return;
        }

        document.getElementById("upload-text").textContent = "Berkas: " + file.name;
        document.getElementById("preview-bukti").style.display = "block";

        if (file.type === "application/pdf") {
          document.getElementById("preview-img").style.display = "none";
          document.getElementById("preview-pdf").style.display = "block";
          document.getElementById("preview-pdf").innerHTML = `${Icons.fileText} ${file.name}`;
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

  if (metode === "tunai") {
    Router.toast("Silakan datang ke sekolah untuk pembayaran tunai");
    Router.go("tagihan");
    return;
  }

  const fileInput = document.getElementById("file-bukti");
  if (!fileInput.files.length) {
    errEl.textContent = "Silakan pilih foto bukti transfer terlebih dahulu";
    return;
  }

  const file = fileInput.files[0];
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    errEl.textContent = "Format file tidak didukung. Gunakan file JPG, PNG, atau PDF";
    return;
  }

  Helpers.btnLoading("btn-kirim-bayar", "Sedang mengunggah...");

  try {
    const uid = Auth.getUid();
    const ext = file.name.split(".").pop();
    const fileName = `bukti-transfer/${uid}/${tagihanId}_${Date.now()}.${ext}`;
    const storageRef = storage.ref(fileName);

    const uploadTask = await storageRef.put(file);
    const buktiUrl = await uploadTask.ref.getDownloadURL();

    const tagihanDoc = await db.collection("tagihan").doc(tagihanId).get();
    const tagihan = tagihanDoc.data();

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

    await db.collection("tagihan").doc(tagihanId).update({
      status: "menunggu",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Router.toast("Bukti pembayaran berhasil dikirim");
    Router.go("riwayat");
  } catch (err) {
    console.error("Upload error:", err);
    errEl.textContent = "Gagal mengunggah: " + err.message;
    Helpers.btnReset("btn-kirim-bayar");
  }
}
