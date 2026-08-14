// ============================================================
// PigFit - Firebase
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCK95bKYEJvtQ0SDG2jt461ZDRBmPSpvLM",
    authDomain: "pig-fit.firebaseapp.com",
    projectId: "pig-fit",
    storageBucket: "pig-fit.firebasestorage.app",
    messagingSenderId: "1089368761044",
    appId: "1:1089368761044:web:4ecdcb36e53a90385f5141"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);