/* ============================================================
   Konfigurasi Kelas — dipakai di seluruh aplikasi
   ============================================================ */

const DAFTAR_KELAS = [
    // KBTK & TK
    "KBTK", "TKA", "TKB",
    // SD
    "SD 1A", "SD 1B", "SD 1C",
    "SD 2A", "SD 2B", "SD 2C",
    "SD 3A", "SD 3B", "SD 3C",
    "SD 4A", "SD 4B", "SD 4C",
    "SD 5A", "SD 5B", "SD 5C",
    "SD 6A", "SD 6B", "SD 6C",
    // SMP
    "SMP 1A", "SMP 1B", "SMP 1C",
    "SMP 2A", "SMP 2B", "SMP 2C",
    "SMP 3A", "SMP 3B", "SMP 3C"
];

/** Urutan kelas (untuk cari kelas sebelumnya — tampil nilai) */
const URUTAN_KELAS = [
    "KBTK", "TKA", "TKB",
    "SD 1A", "SD 1B", "SD 1C",
    "SD 2A", "SD 2B", "SD 2C",
    "SD 3A", "SD 3B", "SD 3C",
    "SD 4A", "SD 4B", "SD 4C",
    "SD 5A", "SD 5B", "SD 5C",
    "SD 6A", "SD 6B", "SD 6C",
    "SMP 1A", "SMP 1B", "SMP 1C",
    "SMP 2A", "SMP 2B", "SMP 2C",
    "SMP 3A", "SMP 3B", "SMP 3C"
];

/**
 * Ambil kelas sebelumnya berdasarkan kelas sekarang.
 * Misal: siswa sekarang SD 2A → kelas sebelumnya SD 1A/1B/1C
 * Karena bisa pindah subkelas (A→B), kita ambil berdasarkan tingkat.
 * Return: nama kelas sebelumnya, atau null kalau sudah kelas pertama.
 */
function getKelasSebelmunya(kelasSekarang) {
    if (!kelasSekarang) return null;

    // Mapping tingkat kelas sebelumnya
    const tingkatSebelumnya = {
        "KBTK": null,
        "TKA": "KBTK",
        "TKB": "TKA",
        "SD 1": "TKB",
        "SD 2": "SD 1",
        "SD 3": "SD 2",
        "SD 4": "SD 3",
        "SD 5": "SD 4",
        "SD 6": "SD 5",
        "SMP 1": "SD 6",
        "SMP 2": "SMP 1",
        "SMP 3": "SMP 2"
    };

    // Ambil tingkat dari nama kelas (misal: "SD 3A" → "SD 3")
    const tingkat = kelasSekarang.replace(/[ABC]$/, "").trim();
    const subkelas = kelasSekarang.slice(-1); // A, B, atau C

    const tingkatSblm = tingkatSebelumnya[tingkat];
    if (!tingkatSblm) return null;

    // Kalau kelas sebelumnya tidak punya subkelas (KBTK, TKA, TKB)
    if (["KBTK", "TKA", "TKB"].includes(tingkatSblm)) {
        return tingkatSblm;
    }

    // Pakai subkelas yang sama (misal: SD 2A → SD 1A)
    return tingkatSblm + subkelas;
}

/** Generate option HTML untuk dropdown kelas */
function getKelasOptions(selected = "") {
    const groups = [
        { label: "TK", items: ["KBTK", "TKA", "TKB"] },
        { label: "SD", items: DAFTAR_KELAS.filter(k => k.startsWith("SD")) },
        { label: "SMP", items: DAFTAR_KELAS.filter(k => k.startsWith("SMP")) }
    ];

    let html = '<option value="">-- Pilih Kelas --</option>';
    groups.forEach(g => {
        html += `<optgroup label="${g.label}">`;
        g.items.forEach(k => {
            html += `<option value="${k}" ${k === selected ? "selected" : ""}>${k}</option>`;
        });
        html += "</optgroup>";
    });
    return html;
}
