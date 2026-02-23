import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCrYT_DMmSg0Cb4bUSsHbdRpCc_Mk4PrII",
    authDomain: "oshc-db.firebaseapp.com",
    projectId: "oshc-db",
    storageBucket: "oshc-db.firebasestorage.app",
    messagingSenderId: "9011301422",
    appId: "1:9011301422:web:ae85b0d9682052c2bb23bf",
    measurementId: "G-8SFEN40BMN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize core Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
