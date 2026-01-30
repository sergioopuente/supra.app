
// ENERGY SYSTEM (Cost Protection & Gamification)

// Action Costs (in % of daily battery)
export const ENERGY_COSTS = {
    text_chat: 2,        // Cheap
    vision: 25,          // Expensive (Image processing)
    live_session: 30,    // Very Expensive (WebSockets/Audio)
    neural_tts: 15,      // Moderate (Audio Generation)
    ikigai: 10           // Moderate
};

const STORAGE_KEY_ENERGY = 'supra_energy_v1';
const STORAGE_KEY_PROFILE = 'supra_profile';

interface EnergyState {
    date: string;
    current: number; // 0 to 100
}

export const QuotaManager = {
    
    isPremium: (): boolean => {
        try {
            const profileStr = localStorage.getItem(STORAGE_KEY_PROFILE);
            if (profileStr) {
                const profile = JSON.parse(profileStr);
                return profile.isPremium === true;
            }
        } catch (e) { return false; }
        return false;
    },

    // Get current energy level (handles daily reset)
    getEnergy: (): number => {
        if (QuotaManager.isPremium()) return 100; // Premium has infinite flow

        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(STORAGE_KEY_ENERGY);
        
        if (stored) {
            const data: EnergyState = JSON.parse(stored);
            if (data.date !== today) {
                // New day, full recharge
                QuotaManager.resetEnergy();
                return 100;
            }
            return data.current;
        } else {
            // First time
            QuotaManager.resetEnergy();
            return 100;
        }
    },

    // Check if user has enough energy for action
    canAfford: (action: keyof typeof ENERGY_COSTS): boolean => {
        if (QuotaManager.isPremium()) return true;
        const current = QuotaManager.getEnergy();
        return current >= ENERGY_COSTS[action];
    },

    // Consume energy
    consume: (action: keyof typeof ENERGY_COSTS): boolean => {
        if (QuotaManager.isPremium()) return true; // No consumption for premium

        const current = QuotaManager.getEnergy();
        const cost = ENERGY_COSTS[action];

        if (current >= cost) {
            const newState: EnergyState = {
                date: new Date().toISOString().split('T')[0],
                current: Math.max(0, current - cost)
            };
            localStorage.setItem(STORAGE_KEY_ENERGY, JSON.stringify(newState));
            
            // Trigger a custom event so UI can update instantly
            window.dispatchEvent(new Event('energy_update'));
            return true;
        }
        return false;
    },

    resetEnergy: () => {
        const newState: EnergyState = {
            date: new Date().toISOString().split('T')[0],
            current: 100
        };
        localStorage.setItem(STORAGE_KEY_ENERGY, JSON.stringify(newState));
        window.dispatchEvent(new Event('energy_update'));
    },

    // Fallback messages when out of energy
    getDepletedMessage: () => {
        const msgs = [
            "Batería mental agotada. El descanso es parte del trabajo.",
            "Has alcanzado tu límite cognitivo hoy. Recarga mañana.",
            "Silencio. Tu mente necesita procesar lo vivido.",
            "Límite de energía alcanzado. Vuelve al amanecer o desbloquea Supra Black."
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
};

export const STOIC_FALLBACKS = [
    "Batería baja. Escribe a mano.",
    "Silencio. Reflexiona sin ayuda.",
    "La respuesta está en ti, no en la IA.",
    "Límite alcanzado. Practica la austeridad.",
];
