/* ============================================================
   Halaman Panduan / Pusat Bantuan (In-Place Accordion Cards)
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
      <div class="card" style="background:var(--hero-gradient);color:white;text-align:center;padding:22px;border:none;margin-bottom:16px">
        <div class="empty-state-icon" style="background:rgba(255,255,255,0.2);color:white;margin-bottom:8px">
          ${Icons.guide}
        </div>
        <div style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Pusat Bantuan SPP</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">
          Panduan praktis pembayaran untuk Orang Tua Siswa Charis Institute
        </div>
      </div>

      <div class="section-title" style="margin-bottom:12px">Topik Panduan Populer</div>

      <!-- Accordion List (In-Place Dropdown Cards) -->
      <div class="faq-accordion-list">

        <!-- 1. Cara Melihat Tagihan SPP -->
        <div class="faq-accordion-item open" id="faq-1">
          <div class="faq-accordion-header" onclick="toggleFaq('faq-1')">
            <div class="faq-header-left">
              <div class="faq-number-badge">1</div>
              <div class="faq-icon-box qa-blue">${Icons.receipt}</div>
              <div class="faq-title">Cara Melihat Tagihan SPP</div>
            </div>
            <span class="faq-chevron">${Icons.chevronDown}</span>
          </div>
          <div class="faq-accordion-body">
            <div class="faq-body-inner">
              ${langkah([
                { no: 1, teks: "Buka aplikasi SPP di ponsel Anda." },
                { no: 2, teks: 'Pilih menu <strong>"Tagihan"</strong> pada bilah navigasi bawah.' },
                { no: 3, teks: "Anda dapat melihat daftar seluruh tagihan per bulan, batas jatuh tempo, dan nominalnya." },
                { no: 4, teks: "Ketuk salah satu tagihan untuk melihat rincian faktur lengkap." },
              ])}
              ${tipBox("Tips untuk Orang Tua", "Tagihan berwarna oranye menandakan belum dibayar. Tagihan berwarna hijau berarti telah lunas.")}
            </div>
          </div>
        </div>

        <!-- 2. Cara Melakukan Pembayaran -->
        <div class="faq-accordion-item" id="faq-2">
          <div class="faq-accordion-header" onclick="toggleFaq('faq-2')">
            <div class="faq-header-left">
              <div class="faq-number-badge">2</div>
              <div class="faq-icon-box qa-indigo">${Icons.wallet}</div>
              <div class="faq-title">Cara Melakukan Pembayaran</div>
            </div>
            <span class="faq-chevron">${Icons.chevronDown}</span>
          </div>
          <div class="faq-accordion-body">
            <div class="faq-body-inner">
              <p class="text-sm text-secondary mb-12">Sekolah menyediakan 2 opsi pembayaran resmi:</p>

              <div style="font-weight:700;margin-bottom:8px;color:var(--text)">Pilihan 1: Transfer Bank BCA</div>
              ${langkah([
                { no: 1, teks: 'Buka tagihan anak Anda, lalu klik tombol <strong>"Bayar Sekarang"</strong>.' },
                { no: 2, teks: "Salin nomor rekening BCA sekolah dan nominal yang tertera." },
                { no: 3, teks: "Buka m-Banking BCA atau ATM, lalu transfer sesuai nominal tepat." },
                { no: 4, teks: "Simpan bukti transfer (struk atau screenshot)." },
                { no: 5, teks: 'Upload bukti transfer tersebut, lalu klik <strong>"Kirim Bukti Pembayaran"</strong>.' },
              ])}

              <div style="font-weight:700;margin:16px 0 8px;color:var(--text)">Pilihan 2: Pembayaran Tunai di Sekolah</div>
              ${langkah([
                { no: 1, teks: "Datang langsung ke loket Bagian Keuangan Charis Institute." },
                { no: 2, teks: "Lakukan pembayaran tunai ke kasir. Petugas akan mencatat dan memberikan kwitansi resmi." },
              ])}
            </div>
          </div>
        </div>

        <!-- 3. Cara Upload Bukti Transfer -->
        <div class="faq-accordion-item" id="faq-3">
          <div class="faq-accordion-header" onclick="toggleFaq('faq-3')">
            <div class="faq-header-left">
              <div class="faq-number-badge">3</div>
              <div class="faq-icon-box qa-emerald">${Icons.camera}</div>
              <div class="faq-title">Cara Upload Bukti Transfer</div>
            </div>
            <span class="faq-chevron">${Icons.chevronDown}</span>
          </div>
          <div class="faq-accordion-body">
            <div class="faq-body-inner">
              ${langkah([
                { no: 1, teks: "Pastikan foto bukti transfer atau screenshot struk jelas dan nominal terbaca." },
                { no: 2, teks: 'Ketuk area <strong>"Pilih Foto Bukti Transfer"</strong> pada formulir.' },
                { no: 3, teks: "Pilih foto dari Galeri HP Anda. Preview foto akan langsung muncul." },
                { no: 4, teks: 'Ketuk <strong>"Kirim Bukti Pembayaran"</strong> dan tunggu hingga muncul notifikasi berhasil.' },
              ])}
              ${tipBox("Catatan Penting", "Ukuran foto maksimal 5MB. Format yang didukung: JPG, PNG, atau PDF.")}
            </div>
          </div>
        </div>

        <!-- 4. Memahami Arti Status Tagihan -->
        <div class="faq-accordion-item" id="faq-4">
          <div class="faq-accordion-header" onclick="toggleFaq('faq-4')">
            <div class="faq-header-left">
              <div class="faq-number-badge">4</div>
              <div class="faq-icon-box qa-amber">${Icons.alertCircle}</div>
              <div class="faq-title">Memahami Arti Status Tagihan</div>
            </div>
            <span class="faq-chevron">${Icons.chevronDown}</span>
          </div>
          <div class="faq-accordion-body">
            <div class="faq-body-inner">
              <div style="margin:6px 0">
                ${statusRow("badge-belum", "Belum Dibayar", "Tagihan belum dibayar. Harap segera diselesaikan sebelum jatuh tempo.")}
                ${statusRow("badge-menunggu", "Menunggu Verifikasi", "Bukti sudah dikirim, petugas sedang memeriksa data transfer.")}
                ${statusRow("badge-lunas", "Lunas", "Pembayaran sah & telah dicatat resmi oleh pihak sekolah.")}
                ${statusRow("badge-revisi", "Perlu Revisi", "Bukti transfer belum jelas. Silakan upload ulang sesuai catatan petugas.")}
                ${statusRow("badge-ditolak", "Ditolak", "Pembayaran tidak valid. Hubungi bagian tata usaha / keuangan.")}
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Cara Memantau Nilai Rapor Anak -->
        <div class="faq-accordion-item" id="faq-5">
          <div class="faq-accordion-header" onclick="toggleFaq('faq-5')">
            <div class="faq-header-left">
              <div class="faq-number-badge">5</div>
              <div class="faq-icon-box qa-purple">${Icons.grade}</div>
              <div class="faq-title">Cara Memantau Nilai Rapor Anak</div>
            </div>
            <span class="faq-chevron">${Icons.chevronDown}</span>
          </div>
          <div class="faq-accordion-body">
            <div class="faq-body-inner">
              ${langkah([
                { no: 1, teks: 'Pada Beranda aplikasi, ketuk menu <strong>"Nilai Rapor"</strong>.' },
                { no: 2, teks: "Nilai rata-rata rapor anak dari kelas berjalan maupun kelas sebelumnya akan ditampilkan lengkap dengan predikat dan nama wali kelas." },
              ])}
            </div>
          </div>
        </div>

      </div>

      <!-- Kontak Petugas Sekolah -->
      <div class="card" style="background:#eff6ff;border-color:#bfdbfe;text-align:center;padding:20px;margin-top:16px">
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

function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;

  const isOpen = item.classList.contains("open");

  // Tutup item accordion lainnya agar rapi seperti pada contoh
  document.querySelectorAll(".faq-accordion-item").forEach((el) => {
    if (el !== item) el.classList.remove("open");
  });

  if (isOpen) {
    item.classList.remove("open");
  } else {
    item.classList.add("open");
    setTimeout(() => {
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 150);
  }
}

function langkah(steps) {
  return steps
    .map(
      (s) => `
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
        <div style="min-width:24px;height:24px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
          ${s.no}
        </div>
        <div style="padding-top:2px">
          <span class="text-sm" style="color:var(--text);line-height:1.45">${s.teks}</span>
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
