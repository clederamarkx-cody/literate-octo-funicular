import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2MkELXc3UvIxcIvQ1dBpuYizRi8sDg6M",
    authDomain: "oshc-gkk.firebaseapp.com",
    projectId: "oshc-gkk",
    storageBucket: "oshc-gkk.firebasestorage.app",
    messagingSenderId: "406392998806",
    appId: "1:406392998806:web:55b2b49fabc15e642e6bb7",
    measurementId: "G-J6H5PSKVD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize core Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
