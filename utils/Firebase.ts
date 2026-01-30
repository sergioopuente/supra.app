
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// --- CONFIGURACIÓN DE MIGRACIÓN ---
// Si estás en Firebase Studio / Project IDX, puedes pegar tus credenciales aquí 
// directamente para probar sin configurar variables de entorno.
const MANUAL_CONFIG = {
    apiKey: "", // PEGA TU API KEY AQUÍ SI ES NECESARIO
    authDomain: "supra-app.firebaseapp.com",
    projectId: "supra-app",
    storageBucket: "supra-app.appspot.com",
    messagingSenderId: "",
    appId: ""
};

// Helper seguro para entorno
const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};

// Prioridad: 1. Manual Config (si existe) -> 2. Environment Variables -> 3. Dummy
const firebaseConfig = {
  apiKey: MANUAL_CONFIG.apiKey || getEnv('REACT_APP_FIREBASE_API_KEY') || "AIzaSyDummyKey-ReplaceWithYours",
  authDomain: MANUAL_CONFIG.authDomain || getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || "supra-app.firebaseapp.com",
  projectId: MANUAL_CONFIG.projectId || getEnv('REACT_APP_FIREBASE_PROJECT_ID') || "supra-app",
  storageBucket: MANUAL_CONFIG.storageBucket,
  messagingSenderId: MANUAL_CONFIG.messagingSenderId,
  appId: MANUAL_CONFIG.appId
};

let app;
let auth: Auth;
let db: Firestore;
let isFirebaseActive = false;

// Check simple de validez
const isValidKey = firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyDummyKey-ReplaceWithYours";

if (isValidKey) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isFirebaseActive = true;
        console.log("🔥 Supra Cloud: Conectado a Firebase Studio/Prod.");
    } catch (error) {
        console.error("⚠️ Supra Cloud Error: Fallo en conexión. Verifica tus credenciales en utils/Firebase.ts", error);
        isFirebaseActive = false;
    }
} else {
    console.warn("⚠️ Supra Cloud: Modo Local. Para conectar a Firebase Studio, actualiza 'utils/Firebase.ts'.");
    isFirebaseActive = false;
}

export { auth, db, isFirebaseActive };
