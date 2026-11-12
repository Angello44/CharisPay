/* ============================================================
   Firebase Configuration
   ============================================================
   Konfigurasi Firebase project: pembayaranspp-f332c
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyD_G203dnpxCOT0H6O5_4hpXZYGfigAVnQ",
  authDomain: "pembayaranspp-f332c.firebaseapp.com",
  projectId: "pembayaranspp-f332c",
  storageBucket: "pembayaranspp-f332c.firebasestorage.app",
  messagingSenderId: "426182644711",
  appId: "1:426182644711:web:8c06eda17a4b3919322342",
  measurementId: "G-3S2NR14PE0",
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Shortcut global untuk service yang dipakai di seluruh app
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
