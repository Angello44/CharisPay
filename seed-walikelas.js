/**
 * Seed Wali Kelas — jalankan sekali di terminal
 * npm install firebase-admin  (kalau belum ada)
 * node seed-walikelas.js
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// ============================================================
// GANTI dengan path ke service account key Anda
// Download dari: Firebase Console → Project Settings →
//   Service Accounts → Generate new private key
// ============================================================
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ============================================================
// Data Wali Kelas — 27 kelas
// Mr. = laki-laki, Ms. = perempuan
// ============================================================
const walikelas = [
    // TK
    { kelas: "KBTK",   namaWali: "Ms. Ratna Dewi",      noHp: "081234567801" },
    { kelas: "TKA",    namaWali: "Ms. Fitri Handayani",  noHp: "081234567802" },
    { kelas: "TKB",    namaWali: "Mr. Bagas Saputra",    noHp: "081234567803" },

    // SD Kelas 1
    { kelas: "SD 1A",  namaWali: "Ms. Lestari Wulandari", noHp: "081234567804" },
    { kelas: "SD 1B",  namaWali: "Mr. Doni Firmansyah",   noHp: "081234567805" },
    { kelas: "SD 1C",  namaWali: "Ms. Yuni Astuti",       noHp: "081234567806" },

    // SD Kelas 2
    { kelas: "SD 2A",  namaWali: "Mr. Hendra Kusuma",     noHp: "081234567807" },
    { kelas: "SD 2B",  namaWali: "Ms. Novi Rahayu",       noHp: "081234567808" },
    { kelas: "SD 2C",  namaWali: "Mr. Rizky Pratama",     noHp: "081234567809" },

    // SD Kelas 3
    { kelas: "SD 3A",  namaWali: "Ms. Dewi Anggraini",    noHp: "081234567810" },
    { kelas: "SD 3B",  namaWali: "Mr. Fajar Nugroho",     noHp: "081234567811" },
    { kelas: "SD 3C",  namaWali: "Ms. Sinta Permata",     noHp: "081234567812" },

    // SD Kelas 4
    { kelas: "SD 4A",  namaWali: "Mr. Andi Wijaya",       noHp: "081234567813" },
    { kelas: "SD 4B",  namaWali: "Ms. Rini Susanti",      noHp: "081234567814" },
    { kelas: "SD 4C",  namaWali: "Mr. Budi Santoso",      noHp: "081234567815" },

    // SD Kelas 5
    { kelas: "SD 5A",  namaWali: "Ms. Mega Puspita",      noHp: "081234567816" },
    { kelas: "SD 5B",  namaWali: "Mr. Galih Prabowo",     noHp: "081234567817" },
    { kelas: "SD 5C",  namaWali: "Ms. Indah Lestari",     noHp: "081234567818" },

    // SD Kelas 6
    { kelas: "SD 6A",  namaWali: "Mr. Wahyu Setiawan",    noHp: "081234567819" },
    { kelas: "SD 6B",  namaWali: "Ms. Ayu Rahmawati",     noHp: "081234567820" },
    { kelas: "SD 6C",  namaWali: "Mr. Teguh Santoso",     noHp: "081234567821" },

    // SMP Kelas 1
    { kelas: "SMP 1A", namaWali: "Ms. Diana Putri",       noHp: "081234567822" },
    { kelas: "SMP 1B", namaWali: "Mr. Arif Budiman",      noHp: "081234567823" },
    { kelas: "SMP 1C", namaWali: "Ms. Eka Nurjanah",      noHp: "081234567824" },

    // SMP Kelas 2
    { kelas: "SMP 2A", namaWali: "Mr. Ridwan Hakim",      noHp: "081234567825" },
    { kelas: "SMP 2B", namaWali: "Ms. Tiara Agustina",    noHp: "081234567826" },
    { kelas: "SMP 2C", namaWali: "Mr. Fandi Akhmad",      noHp: "081234567827" },

    // SMP Kelas 3
    { kelas: "SMP 3A", namaWali: "Ms. Lina Marlina",      noHp: "081234567828" },
    { kelas: "SMP 3B", namaWali: "Mr. Dimas Aditya",      noHp: "081234567829" },
    { kelas: "SMP 3C", namaWali: "Ms. Hana Oktavia",      noHp: "081234567830" },
];

async function seed() {
    console.log("🚀 Mulai insert data wali kelas...\n");

    let berhasil = 0;
    let skip = 0;

    for (const wali of walikelas) {
        // Cek apakah kelas sudah ada
        const snap = await db.collection("walikelas")
            .where("kelas", "==", wali.kelas)
            .get();

        if (!snap.empty) {
            console.log(`⏭  Skip  : ${wali.kelas} (sudah ada)`);
            skip++;
            continue;
        }

        await db.collection("walikelas").add({
            ...wali,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`✅ Insert : ${wali.kelas} → ${wali.namaWali} (${wali.noHp})`);
        berhasil++;
    }

    console.log(`\n✔ Selesai! ${berhasil} data berhasil diinsert, ${skip} di-skip.`);
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
