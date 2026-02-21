import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXD0wnFFxArPjVlOUqIRWoMmYQ4APoU_k",
    authDomain: "oshc-gkk-awards.firebaseapp.com",
    projectId: "oshc-gkk-awards",
    storageBucket: "oshc-gkk-awards.firebasestorage.app",
    messagingSenderId: "992294953245",
    appId: "1:992294953245:web:a60982f6719cde0fe481f4",
    measurementId: "G-RZQ9PL8DGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize core Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
