
import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

const Challenges: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState({
    id: 1,
    title: 'protocolo matutino',
    subtitle: 'sin pantallas la primera hora',
    daysTotal: 7,
    daysDone: 4,
    completedToday: false,
    streak: 12
  });

  const [secondaryChallenges, setSecondaryChallenges] = useState([
    { id: 2, title: 'lectura profunda', time: '15 min', done: true },
    { id: 3, title: 'ducha fría', time: '2 min', done: false }
  ]);

  // Función para vibración sutil (Feedback Háptico)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(15); // 15ms es un "tick" sutil, similar al Taptic Engine
    }
  };

  const toggleMain = () => {
    triggerHaptic();
    setActiveChallenge(prev => ({
        ...prev,
        completedToday: !prev.completedToday,
        daysDone: !prev.completedToday ? prev.daysDone + 1 : prev.daysDone - 1
    }));
  };

  const toggleSecondary = (id: number) => {
    triggerHaptic();
    setSecondaryChallenges(prev => prev.map(c => 
        c.id === id ? { ...c, done: !c.done } : c
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase selection:bg-white selection:text-black">
        {/* Atmosphere Background - Fixed behind content */}
        <div className="absolute top-[-20%] left-[-20%] size-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] size-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Scrollable Container covering full screen */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-40 relative z-10">
            
            {/* Header Content (Now scrolls with page) - Reduced padding top to pt-4 */}
            <div className="px-4 pt-4 pb-6 flex justify-between items-end">
                <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">tu sistema</p>
                    <h1 className="text-3xl font-bold text-white tracking-tighter">hábitos</h1>
                </div>
                {/* Minimalist Streak Badge */}
                <div className="flex items-center gap-2 bg-neutral-900/50 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                    <span className="material-symbols-outlined text-orange-500 text-sm icon-filled drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">local_fire_department</span>
                    <span className="text-xs font-bold text-white tabular-nums">{activeChallenge.streak} días</span>
                </div>
            </div>

            <div className="px-4 space-y-8">
                
                {/* BLOQUE 1: RETO PRINCIPAL (HERO) - Apple Liquid Glass */}
                <section>
                    <div className={`relative w-full rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden group ${activeChallenge.completedToday ? 'bg-white/5 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'liquid-glass'}`}>
                        {/* Progress Background Bar (Subtle) */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                            <div 
                                className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                                style={{ width: `${(activeChallenge.daysDone / activeChallenge.daysTotal) * 100}%` }} 
                            />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest border border-white/5 backdrop-blur-md">foco principal</span>
                                    <h2 className="text-3xl font-bold text-white leading-[0.95] tracking-tighter max-w-[85%]">
                                        {activeChallenge.title}
                                    </h2>
                                    <p className="text-neutral-400 text-sm font-medium">{activeChallenge.subtitle}</p>
                                </div>
                                <div className="size-12 rounded-full border border-white/10 flex items-center justify-center bg-black/20 backdrop-blur-md shadow-inner">
                                    <span className="material-symbols-outlined text-white">smartphone</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Visual Progress Dots */}
                                <div className="flex gap-2">
                                    {Array.from({ length: activeChallenge.daysTotal }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 flex-1 rounded-full ${i < activeChallenge.daysDone ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`} 
                                        />
                                    ))}
                                </div>

                                <button 
                                    onClick={toggleMain}
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${activeChallenge.completedToday ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white text-black hover:bg-neutral-200'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">{activeChallenge.completedToday ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    {activeChallenge.completedToday ? 'completado' : 'marcar como hecho'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BLOQUE 2: RETOS SECUNDARIOS */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">hábitos atómicos</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {secondaryChallenges.map((challenge) => (
                            <button 
                                key={challenge.id}
                                onClick={() => toggleSecondary(challenge.id)}
                                className={`relative rounded-[2rem] p-5 flex flex-col justify-between h-40 transition-all active:scale-95 border ${challenge.done ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-900/40 border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <span className={`material-symbols-outlined text-2xl ${challenge.done ? 'text-emerald-400 animate-in zoom-in spin-in-180' : 'text-neutral-600'}`}>
                                        {challenge.done ? 'check_circle' : 'circle'}
                                    </span>
                                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{challenge.time}</span>
                                </div>
                                
                                <div className="text-left space-y-1">
                                    <p className={`text-sm font-bold leading-tight ${challenge.done ? 'text-white line-through decoration-white/30' : 'text-white'}`}>
                                        {challenge.title}
                                    </p>
                                    <p className="text-neutral-500 text-[10px] font-medium">diario</p>
                                </div>
                            </button>
                        ))}
                        
                        {/* Add New Placeholder */}
                        <button className="rounded-[2rem] p-5 flex flex-col items-center justify-center h-40 border border-white/5 border-dashed bg-white/5 hover:bg-white/10 transition-colors gap-2 group">
                            <div className="size-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white/50">add</span>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">añadir hábito</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
        
        <BottomNav />
    </div>
  );
};

export default Challenges;
