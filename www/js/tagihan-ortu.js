/* ============================================================
   Helper: Ambil Tagihan Milik Ortu (Support Multi Anak)
   ============================================================
   Urutan prioritas:
   1. siswaIds (array) di profil — paling akurat, support multi anak
   2. siswaId tunggal di profil — backward compat
   3. ortuId di dokumen siswa — query ke koleksi siswa
   4. namaSiswa di profil — fallback terakhir
   ============================================================ */

async function getTagihanOrtu() {
  const uid = Auth.getUid();
  const siswaIds = Auth.getSiswaIds(); // array, bisa kosong

  let allSiswaIds = [...siswaIds]; // copy supaya tidak mutate

  // Kalau siswaIds kosong, coba cari lewat koleksi siswa
  if (allSiswaIds.length === 0) {
    const siswaSnap = await db
      .collection("siswa")
      .where("ortuId", "==", uid)
      .get();

    if (!siswaSnap.empty) {
      allSiswaIds = siswaSnap.docs.map((d) => d.id);

      // Simpan ke profil supaya query berikutnya langsung pakai kondisi 1
      Auth.profile.siswaIds = allSiswaIds;
      await db.collection("users").doc(uid).update({
        siswaIds: allSiswaIds,
      });
    }
  }

  let tagihan = [];

  if (allSiswaIds.length > 0) {
    // Query tagihan berdasarkan siswaIds (Firestore 'in' max 10)
    for (let i = 0; i < allSiswaIds.length; i += 10) {
      const batch = allSiswaIds.slice(i, i + 10);
      const snap = await db
        .collection("tagihan")
        .where("siswaId", "in", batch)
        .get();
      tagihan = tagihan.concat(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      );
    }
  } else {
    // Fallback terakhir: pakai namaSiswa dari profil
    const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;
    if (namaSiswa) {
      const snap = await db
        .collection("tagihan")
        .where("namaSiswa", "==", namaSiswa)
        .get();
      tagihan = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  }

  // Urutkan: terbaru dulu (client-side)
  tagihan.sort((a, b) => {
    const ta = a.createdAt ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });

  return tagihan;
}

/** Ambil tagihan dikelompokkan per siswa — untuk tampilan multi anak */
async function getTagihanOrtuPerSiswa() {
    const siswaList = await getSiswaOrtu();
    if (siswaList.length === 0) return {};

    const result = {}; // { siswaId: { siswa: {...}, tagihan: [...] } }

    for (const siswa of siswaList) {
        const snap = await db.collection("tagihan")
            .where("siswaId", "==", siswa.id)
            .get();

        const tagihan = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        tagihan.sort((a, b) => {
            const ta = a.createdAt ? a.createdAt.toMillis() : 0;
            const tb = b.createdAt ? b.createdAt.toMillis() : 0;
            return tb - ta;
        });

        result[siswa.id] = { siswa, tagihan };
    }

    return result;
}
  const uid = Auth.getUid();
  const siswaIds = Auth.getSiswaIds();

  if (siswaIds.length > 0) {
    const results = [];
    for (let i = 0; i < siswaIds.length; i += 10) {
      const batch = siswaIds.slice(i, i + 10);
      const snap = await db
        .collection("siswa")
        .where(firebase.firestore.FieldPath.documentId(), "in", batch)
        .get();
      results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    return results;
  }

  // Cari lewat ortuId
  const snap = await db.collection("siswa").where("ortuId", "==", uid).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
