
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { SyncManager } from '../utils/SyncManager';

const Tracker: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState(70);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['música']);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // EMOTIONAL LOGOUT STATE
  const [showExitQuestion, setShowExitQuestion] = useState(false);

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

  const handleSave = async () => {
      setIsSaving(true);
      
      const checkIn = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mood: mood,
          activities: selectedActivities,
          note: note
      };
      
      // Sync to Cloud
      await SyncManager.saveCheckIn(checkIn);
      
      // Trigger Emotional Logout instead of direct navigation
      setTimeout(() => {
          setIsSaving(false);
          setShowExitQuestion(true);
      }, 500);
  };

  const confirmExit = () => {
      // Fade out effect
      setShowExitQuestion(false);
      setTimeout(() => {
          navigate('/dashboard');
      }, 300);
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden lowercase relative">
      
      {/* Scrollable Container covering the whole screen */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        
        {/* Header Content (Spacer reduced) */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
            <div className="size-10" />
            <div className="size-10" />
        </div>

        {/* Main Content */}
        <div className="px-4 space-y-10">
            {/* Apple Large Title Header */}
            <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">check-in diario</p>
                <h1 className="text-3xl font-bold text-white tracking-tighter">registro</h1>
            </div>

            {/* Mood Slider Big */}
            <section className="flex flex-col items-center gap-8">
                <h3 className="text-2xl font-light text-white">¿cómo va todo?</h3>
                <div className="relative size-40 bg-neutral-900 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    <span className="material-symbols-outlined text-[80px] text-white opacity-80 animate-pulse">
                        {mood > 80 ? 'sentiment_very_satisfied' : mood > 50 ? 'sentiment_satisfied' : mood > 30 ? 'sentiment_neutral' : 'sentiment_dissatisfied'}
                    </span>
                </div>
                <div className="w-full space-y-4">
                    <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
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
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-transparent border-none text-white placeholder-neutral-700 text-lg resize-none outline-none focus:ring-0 leading-relaxed min-h-[120px]"
                        placeholder="solo para tus ojos..."
                    />
                </div>
            </section>

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-16 bg-white text-black rounded-full font-bold text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-4 disabled:opacity-50"
            >
                {isSaving ? (
                    <span>sincronizando...</span>
                ) : (
                    <>
                        <span>guardar cambios</span>
                        <span className="material-symbols-outlined">done_all</span>
                    </>
                )}
            </button>
        </div>
      </div>
      
      {/* EMOTIONAL LOGOUT MODAL */}
      {showExitQuestion && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
              <div className="text-center space-y-12 max-w-sm w-full animate-in zoom-in-95 duration-500 delay-100">
                  <div className="size-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                      <span className="material-symbols-outlined text-4xl text-emerald-300">spa</span>
                  </div>
                  
                  <div className="space-y-3">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">cierre de sesión</p>
                      <h2 className="text-3xl font-light text-white leading-tight">¿te vas más ligero?</h2>
                  </div>

                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={confirmExit}
                          className="w-full h-16 bg-white text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
                      >
                          sí, gracias
                      </button>
                      <button 
                          onClick={confirmExit}
                          className="w-full h-14 text-neutral-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                      >
                          un poco
                      </button>
                  </div>
              </div>
          </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Tracker;
