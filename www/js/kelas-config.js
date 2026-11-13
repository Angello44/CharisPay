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

/**
 * Mobile Bottom Sheet Picker untuk Kelas
 * Mencegah browser native select melompat keluar batas frame mobile
 */
const ClassPicker = {
    _targetInputId: null,
    _onChangeCallback: null,
    _currentCategory: "ALL",
    _selectedValue: "",

    init() {
        if (document.getElementById("class-picker-modal")) return;

        const div = document.createElement("div");
        div.id = "class-picker-modal";
        div.className = "class-picker-overlay hidden";
        div.onclick = (e) => {
            if (e.target === div) ClassPicker.close();
        };

        const closeIcon = (typeof Icons !== "undefined" && Icons.cross)
            ? Icons.cross
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        div.innerHTML = `
            <div class="class-picker-sheet" onclick="event.stopPropagation()">
                <div class="class-picker-handle"></div>
                <div class="class-picker-header">
                    <div class="class-picker-title">Pilih Kelas</div>
                    <button type="button" class="class-picker-close" onclick="ClassPicker.close()" aria-label="Tutup">
                        ${closeIcon}
                    </button>
                </div>
                <div class="filter-tabs" style="margin-bottom:12px">
                    <button type="button" class="filter-chip active" id="cp-tab-ALL" onclick="ClassPicker.filter('ALL')">Semua</button>
                    <button type="button" class="filter-chip" id="cp-tab-TK" onclick="ClassPicker.filter('TK')">TK / KB</button>
                    <button type="button" class="filter-chip" id="cp-tab-SD" onclick="ClassPicker.filter('SD')">SD</button>
                    <button type="button" class="filter-chip" id="cp-tab-SMP" onclick="ClassPicker.filter('SMP')">SMP</button>
                </div>
                <div class="class-picker-grid" id="class-picker-items"></div>
            </div>
        `;

        const container = document.getElementById("app") || document.body;
        container.appendChild(div);
    },

    open(targetInputId, onChangeCallback = null) {
        this.init();
        this._targetInputId = targetInputId;
        this._onChangeCallback = onChangeCallback;

        const inputEl = document.getElementById(targetInputId);
        this._selectedValue = inputEl ? inputEl.value : "";

        // Auto filter kategori berdasarkan kelas yang sedang terpilih
        if (this._selectedValue.startsWith("KB") || this._selectedValue.startsWith("TK")) {
            this._currentCategory = "TK";
        } else if (this._selectedValue.startsWith("SD")) {
            this._currentCategory = "SD";
        } else if (this._selectedValue.startsWith("SMP")) {
            this._currentCategory = "SMP";
        } else {
            this._currentCategory = "ALL";
        }

        this.filter(this._currentCategory);

        const modal = document.getElementById("class-picker-modal");
        if (modal) modal.classList.remove("hidden");
    },

    filter(cat) {
        this._currentCategory = cat;
        ["ALL", "TK", "SD", "SMP"].forEach(c => {
            const tab = document.getElementById(`cp-tab-${c}`);
            if (tab) {
                if (c === cat) tab.classList.add("active");
                else tab.classList.remove("active");
            }
        });

        let list = DAFTAR_KELAS;
        if (cat === "TK") {
            list = DAFTAR_KELAS.filter(k => k === "KBTK" || k.startsWith("TK"));
        } else if (cat === "SD") {
            list = DAFTAR_KELAS.filter(k => k.startsWith("SD"));
        } else if (cat === "SMP") {
            list = DAFTAR_KELAS.filter(k => k.startsWith("SMP"));
        }

        const itemsEl = document.getElementById("class-picker-items");
        if (!itemsEl) return;

        const checkSvg = (typeof Icons !== "undefined" && Icons.check)
            ? Icons.check
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polyline points="20 6 9 17 4 12"/></svg>';

        itemsEl.innerHTML = list.map(k => {
            const isSel = (k === this._selectedValue);
            return `
                <button type="button" class="class-picker-btn ${isSel ? "selected" : ""}" onclick="ClassPicker.select('${k}')">
                    <span>${k}</span>
                    ${isSel ? `<span class="class-picker-check">${checkSvg}</span>` : ""}
                </button>
            `;
        }).join("");
    },

    select(val) {
        this._selectedValue = val;
        this.setValue(this._targetInputId, val);
        if (typeof this._onChangeCallback === "function") {
            this._onChangeCallback(val);
        }
        this.close();
    },

    setValue(inputId, val) {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.value = val || "";
        }
        const textEl = document.getElementById(`text-${inputId}`);
        if (textEl) {
            if (val) {
                textEl.textContent = val;
                textEl.className = "has-value";
            } else {
                textEl.textContent = "-- Pilih Kelas --";
                textEl.className = "placeholder";
            }
        }
    },

    close() {
        const modal = document.getElementById("class-picker-modal");
        if (modal) modal.classList.add("hidden");
    }
};
