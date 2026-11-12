/* ============================================================
   Halaman Panduan / Help Desk (Orang Tua)
   ============================================================
   Panduan cara pakai aplikasi untuk orang tua yang
   kurang familiar dengan teknologi.
   ============================================================ */

Router.register("panduan", {
    title: "Panduan Penggunaan",
    back: true,
    backTo: "dashboard-ortu",
    nav: false,
    requireAuth: true,
    role: "ortu",

    render() {
        return `
            <div class="card" style="background:var(--primary);color:white;text-align:center;padding:20px">
                <div style="font-size:36px;margin-bottom:8px">📱</div>
                <div style="font-size:16px;font-weight:600">Panduan Penggunaan</div>
                <div style="font-size:13px;opacity:0.9;margin-top:4px">
                    Aplikasi SPP Charis Institute
                </div>
            </div>

            <!-- Daftar isi -->
            <div class="card">
                <div class="card-title">Daftar Panduan</div>
                <div class="list-item" onclick="scrollToPanduan('panduan-tagihan')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">💳 Cara Melihat Tagihan SPP</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
                <div class="list-item" onclick="scrollToPanduan('panduan-bayar')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">📤 Cara Membayar SPP</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
                <div class="list-item" onclick="scrollToPanduan('panduan-upload')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">📷 Cara Upload Bukti Transfer</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
                <div class="list-item" onclick="scrollToPanduan('panduan-status')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">🔍 Cara Cek Status Pembayaran</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
                <div class="list-item" onclick="scrollToPanduan('panduan-nilai')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">📊 Cara Melihat Nilai Anak</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
                <div class="list-item" onclick="scrollToPanduan('panduan-riwayat')" style="border-radius:8px">
                    <div class="list-item-left">
                        <div class="list-item-title">📋 Cara Melihat Riwayat Pembayaran</div>
                    </div>
                    <span class="text-secondary">↓</span>
                </div>
            </div>

            <!-- ===== 1. Tagihan ===== -->
            <div id="panduan-tagihan" class="card">
                <div class="card-title">💳 Cara Melihat Tagihan SPP</div>
                ${langkah([
                    { no:1, icon:"🏠", teks:"Buka aplikasi dan login menggunakan email dan password Anda." },
                    { no:2, icon:"📄", teks:'Tap menu <strong>"Tagihan"</strong> di bagian bawah layar.' },
                    { no:3, icon:"👀", teks:"Daftar tagihan SPP anak Anda akan muncul. Setiap tagihan menampilkan nama bulan, jumlah yang harus dibayar, dan statusnya." },
                    { no:4, icon:"🔎", teks:"Tap salah satu tagihan untuk melihat detail lengkapnya." }
                ])}
                ${tipBox("💡 Tip", "Tagihan berwarna kuning artinya belum dibayar. Berwarna biru artinya sudah dikirim tapi menunggu konfirmasi. Berwarna hijau artinya sudah lunas.")}
            </div>

            <!-- ===== 2. Cara Bayar ===== -->
            <div id="panduan-bayar" class="card">
                <div class="card-title">📤 Cara Membayar SPP</div>
                <p class="text-sm text-secondary mb-16">Ada 2 cara membayar SPP:</p>

                <div style="font-weight:600;margin-bottom:8px">🏦 Transfer Bank</div>
                ${langkah([
                    { no:1, icon:"📄", teks:'Buka tagihan yang belum dibayar, lalu tap tombol <strong>"Bayar Sekarang"</strong>.' },
                    { no:2, icon:"🏦", teks:'Pilih metode <strong>"Transfer Bank"</strong>.' },
                    { no:3, icon:"💸", teks:"Transfer uang ke rekening sekolah yang tertera di layar. Pastikan jumlahnya sesuai." },
                    { no:4, icon:"📷", teks:"Foto atau simpan bukti transfer dari aplikasi bank Anda." },
                    { no:5, icon:"📤", teks:'Tap area upload, pilih foto bukti transfer, lalu tap <strong>"Kirim Bukti Pembayaran"</strong>.' }
                ])}

                <div style="font-weight:600;margin:16px 0 8px">💵 Tunai di Sekolah</div>
                ${langkah([
                    { no:1, icon:"🏫", teks:"Datang ke sekolah dan bayar langsung ke petugas keuangan." },
                    { no:2, icon:"✅", teks:"Petugas akan mencatat pembayaran di aplikasi. Status tagihan akan berubah menjadi Lunas." }
                ])}
            </div>

            <!-- ===== 3. Upload Bukti ===== -->
            <div id="panduan-upload" class="card">
                <div class="card-title">📷 Cara Upload Bukti Transfer</div>
                ${langkah([
                    { no:1, icon:"📱", teks:"Buka aplikasi bank atau dompet digital Anda, lalu ambil screenshot atau foto bukti transfer." },
                    { no:2, icon:"📲", teks:'Di aplikasi SPP, buka tagihan → tap <strong>"Bayar Sekarang"</strong> → pilih Transfer Bank.' },
                    { no:3, icon:"🖼️", teks:'Tap area bertuliskan <strong>"Tap untuk pilih foto/file"</strong>.' },
                    { no:4, icon:"🔍", teks:"Pilih foto bukti transfer dari galeri HP Anda. Foto akan muncul sebagai preview." },
                    { no:5, icon:"✉️", teks:'Tap <strong>"Kirim Bukti Pembayaran"</strong>. Tunggu hingga muncul pesan berhasil.' }
                ])}
                ${tipBox("⚠️ Perhatian",
                    "Pastikan foto bukti transfer jelas dan tidak buram. Ukuran file maksimal 5MB. Format yang diterima: JPG, PNG, atau PDF."
                )}
            </div>

            <!-- ===== 4. Cek Status ===== -->
            <div id="panduan-status" class="card">
                <div class="card-title">🔍 Cara Cek Status Pembayaran</div>
                ${langkah([
                    { no:1, icon:"📄", teks:'Buka menu <strong>"Tagihan"</strong> atau <strong>"Riwayat"</strong>.' },
                    { no:2, icon:"🔍", teks:"Lihat label berwarna di sebelah kanan setiap tagihan:" }
                ])}
                <div style="margin:12px 0">
                    ${statusRow("badge-belum",    "Belum Dibayar",       "Tagihan belum dibayar")}
                    ${statusRow("badge-menunggu", "Menunggu Verifikasi", "Bukti transfer sudah dikirim, menunggu dicek admin")}
                    ${statusRow("badge-lunas",    "Lunas",               "Pembayaran sudah dikonfirmasi")}
                    ${statusRow("badge-revisi",   "Perlu Revisi",        "Bukti transfer perlu diperbaiki, cek catatan dari admin")}
                    ${statusRow("badge-ditolak",  "Ditolak",             "Pembayaran ditolak, hubungi admin")}
                </div>
            </div>

            <!-- ===== 5. Nilai ===== -->
            <div id="panduan-nilai" class="card">
                <div class="card-title">📊 Cara Melihat Nilai Anak</div>
                ${langkah([
                    { no:1, icon:"🏠", teks:'Di halaman Beranda, tap tombol <strong>"Nilai Anak"</strong>.' },
                    { no:2, icon:"📊", teks:"Nilai rata-rata akhir kelas sebelumnya akan muncul untuk setiap anak." },
                    { no:3, icon:"ℹ️", teks:"Nilai baru akan muncul setelah anak naik ke kelas berikutnya dan admin sudah menginput nilai." }
                ])}
                ${tipBox("📝 Catatan", "Nilai yang ditampilkan adalah nilai rata-rata akhir dari kelas yang sudah selesai. Misalnya jika anak sekarang di kelas SD 2, nilai yang tampil adalah nilai akhir kelas SD 1.")}
            </div>

            <!-- ===== 6. Riwayat ===== -->
            <div id="panduan-riwayat" class="card">
                <div class="card-title">📋 Cara Melihat Riwayat Pembayaran</div>
                ${langkah([
                    { no:1, icon:"🕐", teks:'Tap menu <strong>"Riwayat"</strong> di bagian bawah layar.' },
                    { no:2, icon:"📋", teks:"Semua transaksi pembayaran yang pernah dilakukan akan tampil di sini, dari yang terbaru." },
                    { no:3, icon:"🔎", teks:"Tap salah satu transaksi untuk melihat detail, termasuk bukti transfer yang pernah dikirim." }
                ])}
            </div>

            <!-- Kontak -->
            <div class="card" style="background:var(--primary-light);text-align:center">
                <div style="font-size:24px;margin-bottom:8px">📞</div>
                <div class="font-semibold mb-8">Masih bingung?</div>
                <p class="text-sm text-secondary">
                    Hubungi petugas keuangan sekolah atau datang langsung ke sekolah untuk mendapat bantuan.
                </p>
            </div>
        `;
    },

    init() {
        // Tidak ada init khusus
    }
});

/** Render langkah-langkah panduan */
function langkah(steps) {
    return steps.map(s => `
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
            <div style="min-width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">
                ${s.no}
            </div>
            <div style="padding-top:4px">
                <span style="margin-right:6px">${s.icon}</span>
                <span class="text-sm">${s.teks}</span>
            </div>
        </div>
    `).join("");
}

/** Render tip/catatan box */
function tipBox(judul, isi) {
    return `
        <div style="background:var(--warning-light);border-radius:8px;padding:12px;margin-top:12px">
            <div class="text-sm font-semibold" style="color:var(--warning);margin-bottom:4px">${judul}</div>
            <p class="text-sm" style="color:var(--warning)">${isi}</p>
        </div>
    `;
}

/** Render baris status */
function statusRow(cls, label, deskripsi) {
    return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span class="badge ${cls}" style="min-width:120px;text-align:center">${label}</span>
            <span class="text-sm text-secondary">${deskripsi}</span>
        </div>
    `;
}

/** Scroll ke section panduan */
function scrollToPanduan(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
