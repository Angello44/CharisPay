/**
 * Seed Data Siswa — jalankan sekali di terminal
 * node seed-siswa.js
 *
 * 30 kelas × 5 siswa = 150 siswa total
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ============================================================
// Pool nama depan & belakang Indonesia
// ============================================================
const namaDepanL = [
    "Ahmad", "Budi", "Dani", "Eko", "Fajar",
    "Galih", "Hendra", "Irwan", "Joko", "Kevin",
    "Lutfi", "Mahesa", "Noval", "Oscar", "Pandu",
    "Raka", "Sandy", "Tegar", "Umar", "Vino",
    "Wahyu", "Yogi", "Zaki", "Arif", "Bagas",
    "Cahyo", "Dimas", "Erwin", "Fandi", "Gilang"
];

const namaDepanP = [
    "Ayu", "Bella", "Citra", "Desi", "Eka",
    "Fitri", "Gita", "Hana", "Indah", "Julia",
    "Karina", "Lestari", "Mega", "Novi", "Oktavia",
    "Putri", "Rini", "Sinta", "Tiara", "Ulfa",
    "Vina", "Wulandari", "Yuni", "Zahra", "Anisa",
    "Bunga", "Dina", "Elsa", "Fenny", "Grace"
];

const namaBelakang = [
    "Santoso", "Wijaya", "Kusuma", "Pratama", "Saputra",
    "Nugroho", "Prabowo", "Setiawan", "Firmansyah", "Rahayu",
    "Lestari", "Wulandari", "Anggraini", "Permata", "Susanti",
    "Handayani", "Dewi", "Putri", "Sari", "Astuti",
    "Budiman", "Hakim", "Aditya", "Oktavia", "Marlina"
];

// ============================================================
// 30 kelas
// ============================================================
const DAFTAR_KELAS = [
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

const SISWA_PER_KELAS = 5;

// Tahun masuk berdasarkan jenjang
function getTahunMasuk(kelas) {
    const tahunSekarang = 2026;
    if (kelas === "KBTK")               return tahunSekarang - 1;
    if (kelas === "TKA")                return tahunSekarang - 1;
    if (kelas === "TKB")                return tahunSekarang - 1;
    if (kelas.startsWith("SD 1"))       return tahunSekarang;
    if (kelas.startsWith("SD 2"))       return tahunSekarang - 1;
    if (kelas.startsWith("SD 3"))       return tahunSekarang - 2;
    if (kelas.startsWith("SD 4"))       return tahunSekarang - 3;
    if (kelas.startsWith("SD 5"))       return tahunSekarang - 4;
    if (kelas.startsWith("SD 6"))       return tahunSekarang - 5;
    if (kelas.startsWith("SMP 1"))      return tahunSekarang - 6;
    if (kelas.startsWith("SMP 2"))      return tahunSekarang - 7;
    if (kelas.startsWith("SMP 3"))      return tahunSekarang - 8;
    return tahunSekarang;
}

// Generate NIS unik: tahun + 3 digit nomor urut
let nisCounter = 1;
function generateNIS(tahunMasuk) {
    const nomor = String(nisCounter++).padStart(3, "0");
    return `${tahunMasuk}${nomor}`;
}

// Pilih nama random dari array
function pick(arr, index) {
    return arr[index % arr.length];
}

// Generate daftar siswa
function generateSiswa() {
    const result = [];
    let globalIndex = 0;

    for (const kelas of DAFTAR_KELAS) {
        const tahunMasuk = getTahunMasuk(kelas);

        for (let i = 0; i < SISWA_PER_KELAS; i++) {
            // Campur laki-perempuan: genap = laki, ganjil = perempuan
            const isLaki = (globalIndex % 2 === 0);
            const jk = isLaki ? "L" : "P";

            const namaDepan = isLaki
                ? pick(namaDepanL, globalIndex)
                : pick(namaDepanP, globalIndex);
            const namaBelakangPilih = pick(namaBelakang, globalIndex + i);
            const nama = `${namaDepan} ${namaBelakangPilih}`;
            const nis  = generateNIS(tahunMasuk);

            result.push({ nama, nis, kelas, jk, tahunMasuk });
            globalIndex++;
        }
    }

    return result;
}

async function seed() {
    console.log("🚀 Mulai insert data siswa...\n");

    const siswaList = generateSiswa();
    let berhasil = 0;
    let skip = 0;

    // Ambil semua NIS yang sudah ada supaya tidak duplikat
    const existingSnap = await db.collection("siswa").get();
    const existingNIS = new Set(existingSnap.docs.map(d => d.data().nis));

    // Pakai batch write untuk efisiensi (max 500 per batch)
    const BATCH_SIZE = 499;
    for (let i = 0; i < siswaList.length; i += BATCH_SIZE) {
        const chunk = siswaList.slice(i, i + BATCH_SIZE);
        const batch = db.batch();

        for (const siswa of chunk) {
            if (existingNIS.has(siswa.nis)) {
                console.log(`⏭  Skip  : ${siswa.nama} NIS ${siswa.nis} (sudah ada)`);
                skip++;
                continue;
            }

            const docRef = db.collection("siswa").doc();
            batch.set(docRef, {
                ...siswa,
                ortuId:    "",
                ortuNama:  "",
                ortuEmail: "",
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`✅ Insert : ${siswa.kelas} | ${siswa.nama} | NIS: ${siswa.nis} | ${siswa.jk === "L" ? "Laki-laki" : "Perempuan"}`);
            berhasil++;
        }

        await batch.commit();
    }

    console.log(`\n✔ Selesai! ${berhasil} siswa berhasil diinsert, ${skip} di-skip.`);
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
