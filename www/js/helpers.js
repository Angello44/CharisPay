/* ============================================================
   Helper Functions — dipakai di seluruh aplikasi
   ============================================================ */

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
            belum:    { label: 'Belum Dibayar',       cls: 'badge-belum' },
            menunggu: { label: 'Menunggu Verifikasi',  cls: 'badge-menunggu' },
            lunas:    { label: 'Lunas',                cls: 'badge-lunas' },
            revisi:   { label: 'Perlu Revisi',         cls: 'badge-revisi' },
            ditolak:  { label: 'Ditolak',              cls: 'badge-ditolak' }
        };
        return map[status] || { label: status, cls: '' };
    },

    /** Render badge status */
    badge(status) {
        const info = this.statusInfo(status);
        return `<span class="badge ${info.cls}">${info.label}</span>`;
    },

    /** Tampilkan loading spinner di dalam container */
    loading(containerId, pesan = 'Memuat data...') {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `<div class="loading">${pesan}</div>`;
    },

    /** Tampilkan empty state di dalam container */
    emptyState(containerId, icon, pesan) {
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
                <div class="empty-state-icon">⚠️</div>
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
            btn.dataset.originalText = btn.textContent;
            btn.textContent = teks;
        }
    },

    /** Kembalikan tombol ke normal */
    btnReset(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText || 'Simpan';
        }
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
