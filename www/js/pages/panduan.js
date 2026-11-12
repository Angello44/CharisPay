/* ============================================================
   Halaman Panduan / Pusat Bantuan (Clean Vector UI)
   ============================================================ */

Router.register("panduan", {
  title: "Pusat Bantuan & Panduan",
  back: true,
  backTo: "dashboard-ortu",
  nav: true,
  requireAuth: true,
  role: "ortu",

  render() {
    return `
      <!-- Hero Header Bantuan -->
      <div class="card" style="background:var(--hero-gradient);color:white;text-align:center;padding:22px;border:none">
        <div class="empty-state-icon" style="background:rgba(255,255,255,0.2);color:white;margin-bottom:8px">
          ${Icons.guide}
        </div>
        <div style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Pusat Bantuan SPP</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">
          Panduan praktis pembayaran untuk Orang Tua Siswa Charis Institute
        </div>
      </div>

      <!-- Navigasi Cepat Topik -->
      <div class="card">
        <div class="card-title">Topik Panduan</div>
        <div class="list-item" onclick="scrollToPanduan('panduan-tagihan')">
          <div class="list-item-left">
            <div class="icon-circle qa-blue">${Icons.wallet}</div>
            <div class="list-item-title">Cara Melihat Tagihan SPP</div>
          </div>
          <span class="list-item-chevron">${Icons.chevronDown}</span>
        </div>
        <div class="list-item" onclick="scrollToPanduan('panduan-bayar')">
          <div class="list-item-left">
            <div class="icon-circle qa-indigo">${Icons.receipt}</div>
            <div class="list-item-title">Cara Melakukan Pembayaran</div>
          </div>
          <span class="list-item-chevron">${Icons.chevronDown}</span>
        </div>
        <div class="list-item" onclick="scrollToPanduan('panduan-upload')">
          <div class="list-item-left">
            <div class="icon-circle qa-emerald">${Icons.camera}</div>
            <div class="list-item-title">Cara Upload Bukti Transfer</div>
          </div>
          <span class="list-item-chevron">${Icons.chevronDown}</span>
        </div>
        <div class="list-item" onclick="scrollToPanduan('panduan-status')">
          <div class="list-item-left">
            <div class="icon-circle qa-amber">${Icons.alertCircle}</div>
            <div class="list-item-title">Memahami Arti Status Tagihan</div>
          </div>
          <span class="list-item-chevron">${Icons.chevronDown}</span>
        </div>
        <div class="list-item" onclick="scrollToPanduan('panduan-nilai')">
          <div class="list-item-left">
            <div class="icon-circle qa-purple">${Icons.grade}</div>
            <div class="list-item-title">Cara Memantau Nilai Rapor Anak</div>
          </div>
          <span class="list-item-chevron">${Icons.chevronDown}</span>
        </div>
      </div>

      <!-- 1. Tagihan -->
      <div id="panduan-tagihan" class="card">
        <div class="card-title">${Icons.wallet} Cara Melihat Tagihan SPP</div>
        ${langkah([
          { no: 1, teks: "Buka aplikasi SPP di ponsel Anda." },
          { no: 2, teks: 'Pilih menu <strong>"Tagihan"</strong> pada bilah navigasi bawah.' },
          { no: 3, teks: "Anda dapat melihat daftar seluruh tagihan per bulan, batas jatuh tempo, dan nominalnya." },
          { no: 4, teks: "Ketuk salah satu tagihan untuk melihat rincian faktur lengkap." },
        ])}
        ${tipBox("Tips untuk Orang Tua", "Tagihan berwarna oranye menandakan belum dibayar. Tagihan berwarna hijau berarti telah lunas.")}
      </div>

      <!-- 2. Cara Bayar -->
      <div id="panduan-bayar" class="card">
        <div class="card-title">${Icons.receipt} Cara Melakukan Pembayaran</div>
        <p class="text-sm text-secondary mb-16">Sekolah menyediakan 2 opsi pembayaran resmi:</p>

        <div style="font-weight:700;margin-bottom:8px;color:var(--text)">Pilihan 1: Transfer Bank BCA</div>
        ${langkah([
          { no: 1, teks: 'Buka tagihan anak Anda, lalu klik tombol <strong>"Bayar Sekarang"</strong>.' },
          { no: 2, teks: "Salin nomor rekening BCA sekolah dan nominal yang tertera." },
          { no: 3, teks: "Buka m-Banking BCA atau ATM, lalu transfer sesuai nominal tepat." },
          { no: 4, teks: "Simpan bukti transfer (struk atau screenshot)." },
          { no: 5, teks: 'Upload bukti transfer tersebut, lalu klik <strong>"Kirim Bukti Pembayaran"</strong>.' },
        ])}

        <div style="font-weight:700;margin:18px 0 8px;color:var(--text)">Pilihan 2: Pembayaran Tunai di Sekolah</div>
        ${langkah([
          { no: 1, teks: "Datang langsung ke loket Bagian Keuangan Charis Institute." },
          { no: 2, teks: "Lakukan pembayaran tunai ke kasir. Petugas akan mencatat dan memberikan kwitansi." },
        ])}
      </div>

      <!-- 3. Upload Bukti -->
      <div id="panduan-upload" class="card">
        <div class="card-title">${Icons.camera} Cara Upload Bukti Transfer</div>
        ${langkah([
          { no: 1, teks: "Pastikan foto bukti transfer atau screenshot struk jelas dan nominal terbaca." },
          { no: 2, teks: 'Ketuk area <strong>"Pilih Foto Bukti Transfer"</strong> pada formulir.' },
          { no: 3, teks: "Pilih foto dari Galeri HP Anda. Preview foto akan langsung muncul." },
          { no: 4, teks: 'Ketuk <strong>"Kirim Bukti Pembayaran"</strong> dan tunggu hingga muncul notifikasi berhasil.' },
        ])}
        ${tipBox("Catatan Penting", "Ukuran foto maksimal 5MB. Format yang didukung: JPG, PNG, atau PDF.")}
      </div>

      <!-- 4. Arti Status -->
      <div id="panduan-status" class="card">
        <div class="card-title">${Icons.alertCircle} Memahami Arti Status Tagihan</div>
        <div style="margin:12px 0">
          ${statusRow("badge-belum", "Belum Dibayar", "Tagihan belum dibayar. Harap segera diselesaikan.")}
          ${statusRow("badge-menunggu", "Menunggu Verifikasi", "Bukti sudah dikirim, petugas sedang memeriksa data.")}
          ${statusRow("badge-lunas", "Lunas", "Pembayaran sah & telah dicatat resmi oleh sekolah.")}
          ${statusRow("badge-revisi", "Perlu Revisi", "Bukti transfer belum jelas. Silakan upload ulang.")}
          ${statusRow("badge-ditolak", "Ditolak", "Pembayaran tidak valid. Hubungi bagian keuangan.")}
        </div>
      </div>

      <!-- 5. Nilai Anak -->
      <div id="panduan-nilai" class="card">
        <div class="card-title">${Icons.grade} Cara Memantau Nilai Rapor Anak</div>
        ${langkah([
          { no: 1, teks: 'Pada Beranda aplikasi, ketuk menu <strong>"Nilai Rapor"</strong>.' },
          { no: 2, teks: "Nilai rata-rata rapor anak dari kelas sebelumnya akan ditampilkan lengkap dengan predikat dan nama wali kelas." },
        ])}
      </div>

      <!-- Kontak Petugas Sekolah -->
      <div class="card" style="background:#eff6ff;border-color:#bfdbfe;text-align:center;padding:20px">
        <div class="empty-state-icon" style="color:var(--primary);background:white;margin-bottom:8px">${Icons.chat}</div>
        <div class="font-bold text-sm" style="color:var(--primary-dark)">Butuh Bantuan Langsung?</div>
        <p class="text-xs text-secondary mt-4 mb-12">
          Petugas keuangan kami siap membantu Anda melalui chat WhatsApp pada hari kerja.
        </p>
        <button class="btn btn-success" onclick="window.open('https://wa.me/6281234567890?text=Halo%20Admin%20Keuangan%20Charis%20Institute%2C%20saya%20orang%20tua%20siswa%20membutuhkan%20bantuan%20seputar%20pembayaran%20SPP.', '_blank')">
          ${Icons.chat} Hubungi Petugas Keuangan via WhatsApp
        </button>
      </div>
    `;
  },

  init() {},
});

function langkah(steps) {
  return steps
    .map(
      (s) => `
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
        <div style="min-width:24px;height:24px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">
          ${s.no}
        </div>
        <div style="padding-top:2px">
          <span class="text-sm">${s.teks}</span>
        </div>
      </div>
    `
    )
    .join("");
}

function tipBox(judul, isi) {
  return `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:var(--radius-sm);padding:12px;margin-top:12px">
      <div class="text-xs font-bold" style="color:#b45309;margin-bottom:2px">${judul}</div>
      <p class="text-xs" style="color:#92400e;line-height:1.4">${isi}</p>
    </div>
  `;
}

function statusRow(cls, label, deskripsi) {
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span class="badge ${cls}" style="min-width:130px;justify-content:center">${label}</span>
      <span class="text-xs text-secondary">${deskripsi}</span>
    </div>
  `;
}

function scrollToPanduan(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
