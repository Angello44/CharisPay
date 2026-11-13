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

      // Ambil catatan dari admin jika status adalah revisi atau ditolak
      let catatanAdminHtml = "";
      if (tagihan.status === "revisi" || tagihan.status === "ditolak") {
        try {
          const trxSnap = await db
            .collection("transaksi")
            .where("tagihanId", "==", tagihan.id)
            .get();

          if (!trxSnap.empty) {
            const allTrx = trxSnap.docs.map((d) => d.data());
            allTrx.sort((a, b) => {
              const ta = a.createdAt ? a.createdAt.toMillis() : 0;
              const tb = b.createdAt ? b.createdAt.toMillis() : 0;
              return tb - ta;
            });
            const latestTrx = allTrx[0];
            if (latestTrx && latestTrx.catatan) {
              const isRevisi = tagihan.status === "revisi";
              catatanAdminHtml = `
                <div class="card" style="background:${isRevisi ? "#fffbeb" : "#fee2e2"};border-color:${isRevisi ? "#fde68a" : "#fecaca"};margin-bottom:14px;padding:12px 14px">
                  <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;color:${isRevisi ? "#b45309" : "#dc2626"}">
                    ${isRevisi ? Icons.alertCircle : Icons.cross}
                    <span>${isRevisi ? "Catatan Revisi dari Petugas Keuangan:" : "Alasan Penolakan dari Petugas Keuangan:"}</span>
                  </div>
                  <div style="font-size:12.5px;color:var(--text);margin-top:6px;font-style:italic">
                    "${latestTrx.catatan}"
                  </div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">
                    Silakan periksa kembali dan unggah bukti transfer yang sesuai.
                  </div>
                </div>
              `;
            }
          }
        } catch (e) {
          console.warn("Gagal memuat catatan verifikasi:", e);
        }
      }

      document.getElementById("pembayaran-content").innerHTML = `
        ${catatanAdminHtml}
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
            <!-- Dropzone Area (tampil saat belum ada berkas) -->
            <div class="upload-area" id="upload-area" onclick="document.getElementById('file-bukti').click()">
              <div class="upload-icon">${Icons.camera}</div>
              <div class="upload-text" id="upload-text">Pilih Foto Bukti Transfer</div>
              <div class="upload-hint">Foto struk ATM atau screenshot m-Banking (JPG, PNG, atau PDF)</div>
            </div>
            <input type="file" id="file-bukti" accept="image/jpeg,image/png,image/jpg,application/pdf" style="display:none">

            <!-- Card Preview Bukti (tampil saat berkas sudah dipilih) -->
            <div id="preview-bukti" class="upload-preview-card" style="display:none">
              <div class="upload-preview-header">
                <div>
                  <div class="upload-preview-badge">${Icons.checkCircle} Berkas Siap Dikirim</div>
                  <div class="upload-preview-filename" id="preview-filename">bukti-transfer.jpg</div>
                  <div class="upload-preview-size" id="preview-filesize">-</div>
                </div>
                <button type="button" class="upload-remove-btn" onclick="hapusBerkasBukti()" title="Hapus Berkas">
                  ${Icons.trash}
                </button>
              </div>

              <div class="upload-preview-body">
                <img id="preview-img" alt="Preview Bukti Pembayaran">
                <div id="preview-pdf" class="upload-preview-pdf" style="display:none"></div>
              </div>

              <div class="upload-preview-actions">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('file-bukti').click()">
                  ${Icons.refresh} Ganti Foto / Berkas
                </button>
              </div>
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

        const maxSize = 15 * 1024 * 1024; // Maksimal 15MB (akan otomatis dikompres sebelum dikirim)
        if (file.size > maxSize) {
          document.getElementById("error-pembayaran").textContent = "Ukuran file terlalu besar, maksimal 15MB";
          this.value = "";
          return;
        }

        document.getElementById("error-pembayaran").textContent = "";

        // Sembunyikan dropzone dashed box agar tampilan rapi
        document.getElementById("upload-area").style.display = "none";
        document.getElementById("preview-bukti").style.display = "block";
        document.getElementById("preview-filename").textContent = file.name;

        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const isPdf = file.type === "application/pdf" || ext === "pdf";
        document.getElementById("preview-filesize").textContent =
          "Ukuran: " + formatFileSize(file.size) + (!isPdf ? " (dikompres otomatis agar upload kilat)" : "");

        if (isPdf) {
          document.getElementById("preview-img").style.display = "none";
          const pdfEl = document.getElementById("preview-pdf");
          pdfEl.style.display = "flex";
          pdfEl.innerHTML = `${Icons.fileText} <span>Dokumen PDF: ${file.name}</span>`;
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

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function hapusBerkasBukti() {
  const fileInput = document.getElementById("file-bukti");
  if (fileInput) fileInput.value = "";
  document.getElementById("upload-area").style.display = "block";
  document.getElementById("preview-bukti").style.display = "none";
  document.getElementById("preview-img").src = "";
  document.getElementById("error-pembayaran").textContent = "";
}

/**
 * Kompres gambar client-side menggunakan HTML5 Canvas.
 * Mengurangi ukuran gambar 3-10MB menjadi ~100-200KB (pengurangan 97%+).
 * Menjadikan upload instan (< 1 detik) tanpa buffer lama.
 */
function kompresGambar(file, maxDimensi = 1280, kualitas = 0.82) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve({ file, base64: null });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimensi || height > maxDimensi) {
          if (width > height) {
            height = Math.round((height * maxDimensi) / width);
            width = maxDimensi;
          } else {
            width = Math.round((width * maxDimensi) / height);
            height = maxDimensi;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", kualitas);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".jpg"),
                { type: "image/jpeg", lastModified: Date.now() }
              );
              resolve({ file: compressedFile, base64: dataUrl });
            } else {
              resolve({ file, base64: dataUrl });
            }
          },
          "image/jpeg",
          kualitas
        );
      };
      img.onerror = () => resolve({ file, base64: null });
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ file, base64: null });
    reader.readAsDataURL(file);
  });
}

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
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const validExts = ["jpg", "jpeg", "png", "pdf"];
  const isImageOrPdf =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    validExts.includes(ext);

  if (!isImageOrPdf) {
    errEl.textContent = "Format file tidak didukung. Gunakan file JPG, PNG, atau PDF";
    return;
  }

  const isPdf = file.type === "application/pdf" || ext === "pdf";

  Helpers.btnLoading("btn-kirim-bayar", "Menyiapkan berkas...");

  try {
    let uploadFile = file;
    let fallbackBase64 = null;

    // 1. Kompresi gambar instan client-side untuk memangkas waktu upload
    if (!isPdf) {
      Helpers.btnLoading("btn-kirim-bayar", "Mengoptimalkan foto...");
      const compResult = await kompresGambar(file, 1280, 0.82);
      uploadFile = compResult.file;
      fallbackBase64 = compResult.base64;
    }

    const uid = Auth.getUid();
    const safeExt = isPdf ? "pdf" : "jpg";
    const fileName = `bukti-transfer/${uid}/${tagihanId}_${Date.now()}.${safeExt}`;
    const storageRef = storage.ref(fileName);

    let buktiUrl = "";

    // 2. Upload dengan progress real-time & proteksi timeout 12s
    try {
      Helpers.btnLoading("btn-kirim-bayar", "Mengunggah bukti: 0%...");

      const uploadTask = storageRef.put(uploadFile);

      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              Helpers.btnLoading("btn-kirim-bayar", `Mengunggah: ${percent}%...`);
            }
          },
          (err) => reject(err),
          async () => {
            const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(downloadUrl);
          }
        );
      });

      // Timeout 12 detik agar tidak pernah stuck buffering
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout upload storage")), 12000)
      );

      buktiUrl = await Promise.race([uploadPromise, timeoutPromise]);
    } catch (storageErr) {
      console.warn("Storage upload timeout/gagal, menggunakan jalur cepat base64:", storageErr);
      if (fallbackBase64) {
        buktiUrl = fallbackBase64;
      } else {
        throw storageErr;
      }
    }

    Helpers.btnLoading("btn-kirim-bayar", "Menyimpan transaksi...");

    const tagihanDoc = await db.collection("tagihan").doc(tagihanId).get();
    const tagihan = tagihanDoc.data() || {};

    await db.collection("transaksi").add({
      tagihanId,
      siswaId: tagihan.siswaId || "",
      namaSiswa: tagihan.namaSiswa || "",
      kelas: tagihan.kelas || "",
      nis: tagihan.nis || "",
      periode: tagihan.periode,
      nominal: tagihan.nominal,
      metode: "transfer",
      buktiUrl,
      buktiTipe: isPdf ? "application/pdf" : "image/jpeg",
      status: "menunggu",
      uid: Auth.getUid(),
      ortuId: Auth.getUid(),
      ortuNama: Auth.profile ? Auth.profile.nama : "",
      catatan: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("tagihan").doc(tagihanId).update({
      status: "menunggu",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Router.toast("Bukti pembayaran berhasil dikirim!");
    Router.go("riwayat");
  } catch (err) {
    console.error("Upload error:", err);
    errEl.textContent = "Gagal mengunggah: " + err.message;
    Helpers.btnReset("btn-kirim-bayar");
  }
}
