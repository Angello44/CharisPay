/* ============================================================
   Helper Functions & Clean Modern SVG Icon System
   ============================================================ */

const Icons = {
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V8l-6-6z"/><line x1="14" y1="2" x2="14" y2="8"/><line x1="20" y1="8" x2="14" y2="8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  grade: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  teacher: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><circle cx="13" cy="8" r="2.5"/><path d="M9.5 14a3.5 3.5 0 0 1 7 0"/></svg>`,
  students: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  student: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>`,
  guide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="6 9 12 15 18 9"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  report: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  verified: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

const Helpers = {

    /** Format angka ke Rupiah: 350000 → "Rp 350.000" */
    rupiah(angka) {
        if (!angka && angka !== 0) return 'Rp 0';
        return 'Rp ' + Number(angka).toLocaleString('id-ID');
    },

    /** Format Firestore Timestamp ke string tanggal Indonesia */
    tanggal(timestamp) {
        if (!timestamp) return '-';
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    },

    /** Format periode dari "2026-11" → "November 2026" */
    periodeLabel(periode) {
        if (!periode) return '-';
        const [tahun, bulan] = periode.split('-');
        const bulanNames = [
            '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return (bulanNames[parseInt(bulan)] || bulan) + ' ' + tahun;
    },

    /** Label & class CSS untuk status pembayaran */
    statusInfo(status) {
        const map = {
            belum:    { label: 'Belum Dibayar',       cls: 'badge-belum',    icon: Icons.warning },
            menunggu: { label: 'Menunggu Verifikasi',  cls: 'badge-menunggu', icon: Icons.clock },
            lunas:    { label: 'Lunas',                cls: 'badge-lunas',    icon: Icons.check },
            revisi:   { label: 'Perlu Revisi',         cls: 'badge-revisi',   icon: Icons.alertCircle },
            ditolak:  { label: 'Ditolak',              cls: 'badge-ditolak',  icon: Icons.cross }
        };
        return map[status] || { label: status, cls: '', icon: '' };
    },

    /** Render badge status dengan SVG icon halus */
    badge(status) {
        const info = this.statusInfo(status);
        const iconHtml = info.icon ? `<span class="badge-icon">${info.icon}</span>` : '';
        return `<span class="badge ${info.cls}">${iconHtml}<span>${info.label}</span></span>`;
    },

    /** Tampilkan loading spinner di dalam container */
    loading(containerId, pesan = 'Memuat data...') {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">${pesan}</div>
            </div>
        `;
    },

    /** Tampilkan empty state di dalam container dengan ikon SVG */
    emptyState(containerId, icon = Icons.fileText, pesan = 'Tidak ada data') {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${pesan}</div>
            </div>
        `;
    },

    /** Tampilkan error di dalam container */
    errorState(containerId, pesan) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon" style="color:var(--danger)">${Icons.alertCircle}</div>
                <div class="empty-state-text" style="color:var(--danger)">${pesan}</div>
            </div>
        `;
    },

    /** Validasi email */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /** Nonaktifkan tombol (loading state) */
    btnLoading(btnId, teks = 'Memproses...') {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = true;
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `<span class="btn-spinner"></span> ${teks}`;
        }
    },

    /** Kembalikan tombol ke normal */
    btnReset(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalText || 'Simpan';
        }
    },

    /** Salin teks ke clipboard dengan toast notifikasi */
    copyToClipboard(text, pesan = 'Tersalin ke clipboard') {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                Router.toast(pesan);
            }).catch(() => {
                this.fallbackCopy(text, pesan);
            });
        } else {
            this.fallbackCopy(text, pesan);
        }
    },

    fallbackCopy(text, pesan) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Router.toast(pesan);
        } catch (e) {
            Router.toast('Gagal menyalin');
        }
    },

    /** Hari & Tanggal lengkap Indonesia (cth: "Kamis, 12 Nov 2026") */
    hariTanggal(date = new Date()) {
        const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
        const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
        const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()];
        return `${hari}, ${d.getDate()} ${bulan} ${d.getFullYear()}`;
    },

    /** Generate ID unik sederhana */
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /** Konfirmasi dialog (promise) */
    confirm(pesan) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-title">Konfirmasi</div>
                    <div class="modal-body">${pesan}</div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="modal-cancel">Batal</button>
                        <button class="btn btn-primary" id="modal-ok">Ya, Lanjutkan</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('modal-ok').onclick = () => {
                overlay.remove();
                resolve(true);
            };
            document.getElementById('modal-cancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };
        });
    }
};
