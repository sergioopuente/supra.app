
import { 
    doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, limit, Timestamp 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db, isFirebaseActive } from './Firebase';

const COLLECTION_USERS = 'users';
const SUBCOL_JOURNAL = 'journal';
const SUBCOL_CHECKINS = 'checkins';
const COLLECTION_FEEDBACK = 'feedback';

export const SyncManager = {
    
    // --- AUTHENTICATION ---
    ensureAuth: async () => {
        if (!isFirebaseActive || !auth) return null;
        if (!auth.currentUser) {
            try {
                console.log("Supra Cloud: Iniciando sesión anónima...");
                const creds = await signInAnonymously(auth);
                return creds.user;
            } catch (e) {
                console.error("Auth Error:", e);
                return null;
            }
        }
        return auth.currentUser;
    },

    // --- PROFILE MANAGEMENT ---
    saveProfile: async (profileData: any) => {
        // 1. Guardar local para velocidad UI
        localStorage.setItem('supra_profile', JSON.stringify(profileData));

        // 2. Sincronizar nube
        const user = await SyncManager.ensureAuth();
        if (user && isFirebaseActive && db) {
            try {
                const userRef = doc(db, COLLECTION_USERS, user.uid);
                // Usamos merge para no sobrescribir subcolecciones u otros campos
                await setDoc(userRef, { profile: profileData }, { merge: true });
                console.log("☁️ Perfil sincronizado en nube.");
            } catch (e) {
                console.error("Error guardando perfil en nube:", e);
            }
        }
    },

    getProfile: async () => {
        // 1. Intentar cargar de nube primero si hay usuario
        if (isFirebaseActive && auth?.currentUser && db) {
            try {
                const userRef = doc(db, COLLECTION_USERS, auth.currentUser.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists() && docSnap.data().profile) {
                    const cloudProfile = docSnap.data().profile;
                    // Actualizar caché local
                    localStorage.setItem('supra_profile', JSON.stringify(cloudProfile));
                    return cloudProfile;
                }
            } catch (e) {
                console.warn("Error leyendo perfil nube, usando local:", e);
            }
        }
        // 2. Fallback local
        const local = localStorage.getItem('supra_profile');
        return local ? JSON.parse(local) : null;
    },

    // --- JOURNAL ENTRIES (SUBCOLLECTION) ---
    saveJournalEntry: async (entry: any) => {
        const user = await SyncManager.ensureAuth();
        
        // Guardar en array local temporal (opcional, para UI optimista)
        // Pero ahora la fuente de verdad es la nube.
        
        if (user && isFirebaseActive && db) {
            try {
                const journalRef = collection(db, COLLECTION_USERS, user.uid, SUBCOL_JOURNAL);
                // Usar ID o dejar que Firestore genere uno. Usamos timestamp para ordenar fácil.
                const docData = {
                    ...entry,
                    savedAt: Timestamp.now()
                };
                await addDoc(journalRef, docData);
                console.log("☁️ Entrada de diario guardada en subcolección.");
            } catch (e) {
                console.error("Error guardando diario:", e);
                // Fallback: Guardar en localStorage queue? (Simplificado por ahora)
            }
        }
    },

    getJournalHistory: async () => {
        if (!isFirebaseActive || !auth?.currentUser || !db) return [];
        const user = auth.currentUser;

        try {
            const journalRef = collection(db, COLLECTION_USERS, user.uid, SUBCOL_JOURNAL);
            const q = query(journalRef, orderBy('timestamp', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (e) {
            console.error("Error obteniendo historial diario:", e);
            return [];
        }
    },

    // --- CHECK-INS (SUBCOLLECTION) ---
    saveCheckIn: async (checkIn: any) => {
        const user = await SyncManager.ensureAuth();
        if (user && isFirebaseActive && db) {
            try {
                const checkinsRef = collection(db, COLLECTION_USERS, user.uid, SUBCOL_CHECKINS);
                await addDoc(checkinsRef, {
                    ...checkIn,
                    savedAt: Timestamp.now()
                });
                console.log("☁️ Check-in guardado.");
            } catch (e) {
                console.error("Error guardando check-in:", e);
            }
        }
    },

    // --- FEEDBACK ---
    saveFeedback: async (feedback: any) => {
        localStorage.setItem('supra_has_rated', 'true');
        if (isFirebaseActive && db) {
            try {
                await addDoc(collection(db, COLLECTION_FEEDBACK), {
                    ...feedback,
                    userId: auth?.currentUser?.uid || 'anonymous',
                    timestamp: Timestamp.now(),
                    appVersion: '1.4.0'
                });
            } catch (e) { console.error(e); }
        }
    }
};
