
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// En Next.js, las variables de entorno expuestas al cliente DEBEN empezar por NEXT_PUBLIC_
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Singleton pattern para Next.js (evita re-inicialización en hot-reload)
let app;
let auth: Auth;
let db: Firestore;
let isFirebaseActive = false;

// Verificación básica
if (firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        isFirebaseActive = true;
    } catch (error) {
        console.error("Firebase init error:", error);
    }
} else {
    console.warn("⚠️ Firebase keys missing in .env.local");
}

export { auth, db, isFirebaseActive };
