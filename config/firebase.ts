import { initializeApp } from 'firebase/app';
// Importamos los tipos para que TypeScript no se queje
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuración de SUPRA
const firebaseConfig = {
  apiKey: "AIzaSyBb-cvOXKZ72f7k1bPW0q5QhGecx-cztNo",
  authDomain: "studio-5557656243-614cc.firebaseapp.com",
  projectId: "studio-5557656243-614cc",
  storageBucket: "studio-5557656243-614cc.firebasestorage.app",
  messagingSenderId: "185938588087",
  // Usamos un placeholder para web si aún no lo has generado en consola, 
  // esto permite que la app arranque sin romper el build.
  appId: "1:185938588087:web:placeholder_supra" 
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios tipados
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);