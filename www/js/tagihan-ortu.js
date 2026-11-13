/* ============================================================
   Helper: Ambil Tagihan Milik Ortu (Support Multi Anak)
   ============================================================
   Mendukung orang tua dengan 1 anak maupun 2+ anak (multi anak).
   Tagihan dikelola per siswa (siswaId), nominal dan periode
   masing-masing anak terpisah secara jelas.
   ============================================================ */

/**
 * Mengambil daftar data siswa milik orang tua yang sedang login.
 * Menggabungkan siswaIds dari profil user dan ortuId di dokumen siswa.
 */
async function getSiswaOrtu() {
  const uid = Auth.getUid();
  if (!uid) return [];

  const profileIds = Auth.getSiswaIds(); // array
  const idSet = new Set(profileIds);
  const userEmail = (Auth.user && Auth.user.email) ? Auth.user.email.toLowerCase() : "";

  try {
    // 1. Cari siswa yang memiliki ortuId == uid
    const ortuSnap = await db
      .collection("siswa")
      .where("ortuId", "==", uid)
      .get();

    ortuSnap.docs.forEach((doc) => idSet.add(doc.id));

    // 2. Cari siswa yang dicantumkan email ortu sama dengan akun ini (auto-heal dua arah)
    if (userEmail) {
      const emailSnap = await db
        .collection("siswa")
        .where("ortuEmail", "==", userEmail)
        .get();

      emailSnap.docs.forEach((doc) => {
        idSet.add(doc.id);
        const sData = doc.data();
        if (!sData.ortuId || sData.ortuId !== uid) {
          doc.ref.update({
            ortuId: uid,
            ortuNama: (Auth.profile && Auth.profile.nama) || sData.ortuNama || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }).catch((e) => console.warn("Auto-sync ortuId siswa gagal:", e));
        }
      });
    }

    const allSiswaIds = Array.from(idSet);
    if (allSiswaIds.length === 0) return [];

    // Jika ada ID baru yang belum tersimpan di profile, sinkronkan ke user doc
    if (
      Auth.profile &&
      (!Array.isArray(Auth.profile.siswaIds) ||
        Auth.profile.siswaIds.length !== allSiswaIds.length)
    ) {
      Auth.profile.siswaIds = allSiswaIds;
      db.collection("users")
        .doc(uid)
        .update({ siswaIds: allSiswaIds })
        .catch((err) => console.warn("Sinkron siswaIds gagal:", err));
    }

    // Ambil dokumen lengkap siswa berdasarkan ID
    const siswaList = [];
    for (let i = 0; i < allSiswaIds.length; i += 10) {
      const batch = allSiswaIds.slice(i, i + 10);
      const snap = await db
        .collection("siswa")
        .where(firebase.firestore.FieldPath.documentId(), "in", batch)
        .get();

      snap.docs.forEach((d) => siswaList.push({ id: d.id, ...d.data() }));
    }

    // Urutkan berdasarkan nama siswa
    siswaList.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
    return siswaList;
  } catch (err) {
    console.error("Error getSiswaOrtu:", err);
    return [];
  }
}

/**
 * Mengambil seluruh tagihan untuk semua anak milik orang tua.
 * Mengembalikan array daftar tagihan berurutan dari yang terbaru.
 */
async function getTagihanOrtu() {
  const siswaList = await getSiswaOrtu();
  const allSiswaIds = siswaList.map((s) => s.id);

  let tagihan = [];

  if (allSiswaIds.length > 0) {
    // Query tagihan berdasarkan siswaIds (Firestore 'in' max 10 per batch)
    for (let i = 0; i < allSiswaIds.length; i += 10) {
      const batch = allSiswaIds.slice(i, i + 10);
      const snap = await db
        .collection("tagihan")
        .where("siswaId", "in", batch)
        .get();

      tagihan = tagihan.concat(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    }
  } else {
    // Fallback terakhir: cek namaSiswa di profil jika belum ada siswa terhubung
    const namaSiswa = Auth.profile ? Auth.profile.namaSiswa : null;
    if (namaSiswa) {
      const snap = await db
        .collection("tagihan")
        .where("namaSiswa", "==", namaSiswa)
        .get();
      tagihan = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  }

  // Deduplikasi berdasarkan id dokumen tagihan
  const map = new Map();
  tagihan.forEach((t) => map.set(t.id, t));
  const deduped = Array.from(map.values());

  // Urutkan: terbaru dulu (client-side)
  deduped.sort((a, b) => {
    const ta = a.createdAt ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });

  return deduped;
}

/**
 * Mengambil tagihan dikelompokkan per siswa (struktur lengkap multi anak).
 * Menghitung rekap summary per anak dan summary total keluarga.
 */
async function getTagihanOrtuPerSiswa() {
  const siswaList = await getSiswaOrtu();
  if (siswaList.length === 0) {
    return {
      siswaList: [],
      perSiswa: {},
      totalSummary: {
        totalCount: 0,
        belumCount: 0,
        menungguCount: 0,
        lunasCount: 0,
        totalNominalBelum: 0,
        totalNominalLunas: 0,
      },
    };
  }

  const perSiswa = {};
  const totalSummary = {
    totalCount: 0,
    belumCount: 0,
    menungguCount: 0,
    lunasCount: 0,
    totalNominalBelum: 0,
    totalNominalLunas: 0,
  };

  for (const siswa of siswaList) {
    const snap = await db
      .collection("tagihan")
      .where("siswaId", "==", siswa.id)
      .get();

    const tagihan = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Urutkan per tagihan terbaru
    tagihan.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    // Hitung ringkasan per siswa
    const summary = {
      total: tagihan.length,
      belum: 0,
      menunggu: 0,
      lunas: 0,
      totalNominalBelum: 0,
      totalNominalLunas: 0,
    };

    tagihan.forEach((t) => {
      totalSummary.totalCount++;
      const nominal = Number(t.nominal) || 0;

      if (
        t.status === "belum" ||
        t.status === "revisi" ||
        t.status === "ditolak"
      ) {
        summary.belum++;
        summary.totalNominalBelum += nominal;
        totalSummary.belumCount++;
        totalSummary.totalNominalBelum += nominal;
      } else if (t.status === "menunggu") {
        summary.menunggu++;
        totalSummary.menungguCount++;
      } else if (t.status === "lunas") {
        summary.lunas++;
        summary.totalNominalLunas += nominal;
        totalSummary.lunasCount++;
        totalSummary.totalNominalLunas += nominal;
      }
    });

    perSiswa[siswa.id] = {
      siswa,
      tagihan,
      summary,
    };
  }

  return {
    siswaList,
    perSiswa,
    totalSummary,
  };
}
