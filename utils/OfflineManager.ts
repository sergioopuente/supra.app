
// OFFLINE ASSET MANAGER
// Uses IndexedDB to store heavy audio blobs for offline playback.

const DB_NAME = 'SupraOfflineDB';
const STORE_NAME = 'audio_assets';
const DB_VERSION = 1;

export const OfflineManager = {
    openDB: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    },

    saveAudio: async (key: string, blob: Blob) => {
        try {
            const db = await OfflineManager.openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            
            // Store as ArrayBuffer to avoid serialization issues in some browsers
            const buffer = await blob.arrayBuffer();
            
            store.put({ 
                id: key, 
                data: buffer, 
                type: blob.type, 
                timestamp: Date.now() 
            }, key);
            
            console.log(`🔌 Offline: Audio cached [${key}]`);
        } catch (e) {
            console.error("Offline Save Error", e);
        }
    },

    getAudio: async (key: string): Promise<Blob | null> => {
        try {
            const db = await OfflineManager.openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        console.log(`🔌 Offline: Cache Hit [${key}]`);
                        resolve(new Blob([result.data], { type: result.type }));
                    } else {
                        resolve(null);
                    }
                };
                
                request.onerror = () => resolve(null);
            });
        } catch (e) {
            return null;
        }
    }
};
