
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Tracker: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState(70);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['música']);

  const toggleActivity = (act: string) => {
    setSelectedActivities(prev => 
        prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const activities = [
    { icon: 'headphones', label: 'música' },
    { icon: 'school', label: 'estudio' },
    { icon: 'sports_esports', label: 'juego' },
    { icon: 'diversity_3', label: 'social' },
    { icon: 'bed', label: 'descanso' },
    { icon: 'fitness_center', label: 'entreno' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden lowercase relative">
      <header className="sticky top-0 z-40 apple-blur bg-black/80 border-b border-white/5 flex items-center justify-between px-6 pt-12 pb-4">
        {/* Placeholder para mantener centro */}
        <div className="size-10" />
        <h2 className="text-base font-bold tracking-widest uppercase text-neutral-400">registro hoy</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 px-6 py-8 space-y-12 overflow-y-auto no-scrollbar pb-40">
        {/* Mood Slider Big */}
        <section className="flex flex-col items-center gap-8 pt-4">
            <h3 className="text-2xl font-light text-white">¿cómo va todo?</h3>
            <div className="relative size-40 bg-neutral-900 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <span className="material-symbols-outlined text-[80px] text-white opacity-80 animate-pulse">
                    {mood > 80 ? 'sentiment_very_satisfied' : mood > 50 ? 'sentiment_satisfied' : mood > 30 ? 'sentiment_neutral' : 'sentiment_dissatisfied'}
                </span>
            </div>
            <div className="w-full space-y-4">
                <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-2">
                    <span>caos</span>
                    <span>orden</span>
                </div>
                <div className="relative h-2 bg-neutral-900 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all" style={{ width: `${mood}%` }} />
                    <input 
                        type="range" value={mood} 
                        onChange={(e) => setMood(Number(e.target.value))} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 size-7 bg-white rounded-full shadow-2xl border-4 border-black" style={{ left: `calc(${mood}% - 14px)` }} />
                </div>
            </div>
        </section>

        {/* Activities */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">¿qué has hecho?</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 px-1 -mx-2 pl-2">
                {activities.map(act => (
                    <button 
                        key={act.label}
                        onClick={() => toggleActivity(act.label)}
                        className={`flex flex-col items-center gap-3 shrink-0 transition-all ${selectedActivities.includes(act.label) ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}
                    >
                        <div className={`size-20 rounded-full flex items-center justify-center border ${selectedActivities.includes(act.label) ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-white/5'}`}>
                            <span className="material-symbols-outlined text-[28px]">{act.icon}</span>
                        </div>
                        <span className="text-xs font-bold">{act.label}</span>
                    </button>
                ))}
            </div>
        </section>

        {/* Note */}
        <section className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">una breve reflexión</h3>
            <div className="bg-neutral-900 rounded-3xl p-6 border border-white/5 focus-within:border-white/20 transition-colors">
                <textarea 
                    className="w-full bg-transparent border-none text-white placeholder-neutral-700 text-lg resize-none outline-none focus:ring-0 leading-relaxed min-h-[120px]"
                    placeholder="solo para tus ojos..."
                />
            </div>
        </section>

        <button 
            onClick={() => navigate('/dashboard')}
            className="w-full h-16 bg-white text-black rounded-full font-bold text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-4"
        >
            <span>guardar cambios</span>
            <span className="material-symbols-outlined">done_all</span>
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Tracker;
