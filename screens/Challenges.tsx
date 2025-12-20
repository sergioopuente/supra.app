
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

  const toggleMain = () => {
    setActiveChallenge(prev => ({
        ...prev,
        completedToday: !prev.completedToday,
        daysDone: !prev.completedToday ? prev.daysDone + 1 : prev.daysDone - 1
    }));
  };

  const toggleSecondary = (id: number) => {
    setSecondaryChallenges(prev => prev.map(c => 
        c.id === id ? { ...c, done: !c.done } : c
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase selection:bg-white selection:text-black">
        {/* Atmosphere */}
        <div className="absolute top-[-20%] left-[-20%] size-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] size-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        <header className="px-6 pt-14 pb-6 flex justify-between items-end sticky top-0 z-40">
            <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">tu sistema</p>
                <h1 className="text-3xl font-bold text-white tracking-tighter">hábitos</h1>
            </div>
            {/* Minimalist Streak Badge */}
            <div className="flex items-center gap-2 bg-neutral-900/50 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                <span className="material-symbols-outlined text-orange-500 text-sm icon-filled drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">local_fire_department</span>
                <span className="text-xs font-bold text-white tabular-nums">{activeChallenge.streak} días</span>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-40 space-y-8">
            
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
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                            i < activeChallenge.daysDone 
                                                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                                                : 'bg-white/10'
                                        }`} 
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={toggleMain}
                                className={`w-full h-14 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                                    activeChallenge.completedToday 
                                        ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400' 
                                        : 'bg-white text-black hover:bg-neutral-200 shadow-xl'
                                }`}
                            >
                                {activeChallenge.completedToday ? (
                                    <>
                                        <span>completado</span>
                                        <span className="material-symbols-outlined text-lg">check</span>
                                    </>
                                ) : (
                                    <span>marcar hoy</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-center text-[10px] text-neutral-600 mt-3 font-bold uppercase tracking-widest opacity-60">
                    constancia &gt; intensidad
                </p>
            </section>

            {/* BLOQUE 2: SECUNDARIOS */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">mantenimiento</h3>
                <div className="space-y-3">
                    {secondaryChallenges.map(challenge => (
                        <button 
                            key={challenge.id}
                            onClick={() => toggleSecondary(challenge.id)}
                            className={`w-full rounded-[1.2rem] p-5 flex items-center justify-between transition-all active:scale-[0.98] border group ${
                                challenge.done 
                                    ? 'bg-neutral-900/40 border-emerald-500/20' 
                                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800/60'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                    challenge.done ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'border-white/20 bg-transparent group-hover:border-white/40'
                                }`}>
                                    {challenge.done && <span className="material-symbols-outlined text-black text-xs font-bold">check</span>}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-bold transition-all duration-300 ${challenge.done ? 'text-white/40 line-through decoration-white/40' : 'text-white'}`}>
                                        {challenge.title}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">{challenge.time}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* BLOQUE 4: NUEVO / SUGERENCIA */}
            <section className="pt-2">
                <button className="w-full py-4 rounded-[1.2rem] border border-dashed border-white/10 text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">add</span>
                    añadir nuevo hábito
                </button>
            </section>

        </main>
        <BottomNav />
    </div>
  );
};

export default Challenges;
