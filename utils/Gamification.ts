
export interface Rank {
    id: string;
    name: string;
    minXp: number;
    icon: string;
    color: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: string;
}

export const RANKS: Rank[] = [
    { id: 'neophyte', name: 'neófito', minXp: 0, icon: 'seedling', color: 'text-neutral-400' },
    { id: 'apprentice', name: 'aprendiz', minXp: 100, icon: 'edit_road', color: 'text-cyan-400' },
    { id: 'stoic', name: 'estoico', minXp: 500, icon: 'balance', color: 'text-emerald-400' },
    { id: 'philosopher', name: 'filósofo', minXp: 1500, icon: 'psychology', color: 'text-purple-400' },
    { id: 'sage', name: 'sabio', minXp: 3000, icon: 'auto_awesome', color: 'text-amber-400' },
    { id: 'emperor', name: 'emperador', minXp: 6000, icon: 'crown', color: 'text-yellow-200' },
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_step', title: 'el despertar', description: 'completa tu primer registro de diario.', icon: 'footprint', xpReward: 50, condition: 'first_log' },
    { id: 'week_streak', title: 'constancia', description: 'mantén una racha de 7 días.', icon: 'date_range', xpReward: 150, condition: 'streak_7' },
    { id: 'lux_master', title: 'iluminado', description: 'medita 7 días seguidos en modo lux.', icon: 'wb_sunny', xpReward: 300, condition: 'spiritual_7' },
    { id: 'voice_explorer', title: 'orador', description: 'usa gemini live por 10 minutos.', icon: 'graphic_eq', xpReward: 100, condition: 'voice_10m' },
    { id: 'visionary', title: 'visionario', description: 'analiza 5 imágenes con ia.', icon: 'center_focus_strong', xpReward: 200, condition: 'vision_5' },
    { id: 'founder', title: 'mecenas', description: 'únete a supra black.', icon: 'diamond', xpReward: 1000, condition: 'premium' },
];

export const Gamification = {
    getCurrentRank: (xp: number): Rank => {
        // Encontrar el rango más alto que cumpla minXp <= xp
        return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
    },

    getNextRank: (xp: number): Rank | null => {
        return RANKS.find(r => r.minXp > xp) || null;
    },

    getProgressToNext: (xp: number): number => {
        const current = Gamification.getCurrentRank(xp);
        const next = Gamification.getNextRank(xp);
        if (!next) return 100;
        
        const range = next.minXp - current.minXp;
        const progress = xp - current.minXp;
        return Math.min(100, Math.max(0, (progress / range) * 100));
    }
};
