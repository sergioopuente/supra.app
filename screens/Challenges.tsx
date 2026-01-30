
import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { Gamification, Rank } from '../utils/Gamification';

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

  const [showShareModal, setShowShareModal] = useState(false);
  
  // Dummy data for visual representation of the share card
  // In a real scenario, fetch this from localStorage/context
  const userRank: Rank = { id: 'apprentice', name: 'aprendiz', minXp: 100, icon: 'edit_road', color: 'text-cyan-400' };
  const userXp = 350;

  const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(15);
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
        {/* Atmosphere Background */}
        <div className="absolute top-[-20%] left-[-20%] size-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] size-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-40 relative z-10">
            
            <div className="px-4 pt-4 pb-6 flex justify-between items-end">
                <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">tu sistema</p>
                    <h1 className="text-3xl font-bold text-white tracking-tighter">hábitos</h1>
                </div>
                {/* Streak Badge with Share Action */}
                <button 
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 bg-neutral-900/50 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-orange-500 text-sm icon-filled drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">local_fire_department</span>
                    <span className="text-xs font-bold text-white tabular-nums">{activeChallenge.streak} días</span>
                    <span className="material-symbols-outlined text-neutral-500 text-xs ml-1">ios_share</span>
                </button>
            </div>

            <div className="px-4 space-y-8">
                
                {/* BLOQUE 1: RETO PRINCIPAL */}
                <section>
                    <div className={`relative w-full rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden group ${activeChallenge.completedToday ? 'bg-white/5 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'liquid-glass'}`}>
                        {/* Progress Background Bar */}
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
        
        {/* SOCIAL SHARE MODAL */}
        {showShareModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-sm flex flex-col items-center space-y-8">
                    
                    {/* The Instagram Story Card (Designed for screenshots) */}
                    <div className="w-full aspect-[9/16] bg-black rounded-[2rem] relative overflow-hidden border border-white/10 shadow-2xl flex flex-col p-8 items-center text-center justify-between group select-none">
                        
                        {/* Background Aesthetics */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-cyan-900/30 to-transparent opacity-60" />
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-purple-900/30 to-transparent opacity-60" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-white/5 rounded-full blur-[80px]" />

                        {/* Branding */}
                        <div className="relative z-10 pt-4">
                            <h2 className="font-serif italic text-3xl text-white tracking-tighter">supra</h2>
                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-500">mindset OS</p>
                        </div>

                        {/* Central Stats */}
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            
                            {/* Streak Counter Big */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />
                                <div className="text-[80px] font-bold text-white leading-none tracking-tighter tabular-nums drop-shadow-lg">
                                    {activeChallenge.streak}
                                </div>
                                <div className="text-sm font-bold text-orange-400 uppercase tracking-[0.3em] text-center mt-2">
                                    días racha
                                </div>
                            </div>

                            {/* Rank Badge */}
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md mt-4">
                                <span className={`material-symbols-outlined text-lg ${userRank.color} icon-filled`}>{userRank.icon}</span>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">rango {userRank.name}</span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="relative z-10 w-full border-t border-white/10 pt-6 flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">progreso total</p>
                                <p className="text-xl font-bold text-white">{(userXp / 1000).toFixed(1)}k <span className="text-sm text-neutral-600">xp</span></p>
                            </div>
                            <div className="size-12 bg-white text-black rounded-full flex items-center justify-center font-serif italic font-bold text-xl">
                                S
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col w-full gap-3">
                        <button className="w-full h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">photo_camera</span>
                            captura esto
                        </button>
                        <button 
                            onClick={() => setShowShareModal(false)}
                            className="w-full py-3 text-neutral-500 font-bold uppercase tracking-widest text-xs hover:text-white"
                        >
                            cerrar
                        </button>
                    </div>

                    <p className="text-[10px] text-neutral-600 max-w-xs text-center">
                        haz una captura de pantalla y compártela en tus stories para inspirar a otros.
                    </p>
                </div>
            </div>
        )}

        <BottomNav />
    </div>
  );
};

export default Challenges;
