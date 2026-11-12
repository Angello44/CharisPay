/* ============================================================
   Helper: Ambil Tagihan Milik Ortu
   ============================================================
   Dipakai bersama oleh dashboard-ortu.js dan tagihan.js.
   Urutan prioritas:
   1. siswaId di profil (paling akurat, dihubungkan admin)
   2. ortuId di dokumen siswa (query ke koleksi siswa)
   3. namaSiswa di profil (fallback terakhir)
   ============================================================ */

async function getTagihanOrtu() {
    const uid       = Auth.getUid();
    const siswaId   = Auth.getSiswaId();   // dari profil kalau sudah dihubungkan
    const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;

    let tagihan = [];

    if (siswaId) {
        // ✅ Cara terbaik: pakai siswaId langsung dari profil
        const snap = await db.collection("tagihan")
            .where("siswaId", "==", siswaId)
            .get();
        tagihan = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    } else {
        // Coba cari lewat koleksi siswa dengan ortuId
        const siswaSnap = await db.collection("siswa")
            .where("ortuId", "==", uid)
            .get();

        if (!siswaSnap.empty) {
            // Ada siswa yang terhubung ke ortu ini
            const ids = siswaSnap.docs.map(d => d.id);

            // Firestore 'in' max 10 per query
            for (let i = 0; i < ids.length; i += 10) {
                const batch = ids.slice(i, i + 10);
                const snap = await db.collection("tagihan")
                    .where("siswaId", "in", batch)
                    .get();
                tagihan = tagihan.concat(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }

            // Simpan siswaId ke profil supaya query berikutnya lebih cepat
            if (ids.length === 1) {
                Auth.profile.siswaId = ids[0];
                await db.collection("users").doc(uid).update({ siswaId: ids[0] });
            }

        } else if (namaSiswa) {
            // Fallback: pakai namaSiswa — kurang akurat tapi berguna sebelum admin hubungkan
            const snap = await db.collection("tagihan")
                .where("namaSiswa", "==", namaSiswa)
                .get();
            tagihan = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
    }

    // Urutkan: terbaru dulu (client-side, hindari composite index)
    tagihan.sort((a, b) => {
        const ta = a.createdAt ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt ? b.createdAt.toMillis() : 0;
        return tb - ta;
    });

    return tagihan;
}
