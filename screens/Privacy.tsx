
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { GoogleGenAI } from '@google/genai';
import { QuotaManager } from '../utils/QuotaManager';
import { Gamification, ACHIEVEMENTS, Rank } from '../utils/Gamification';
import { SyncManager } from '../utils/SyncManager';
import { isFirebaseActive } from '../utils/Firebase';
import { getLanguage, setLanguage, t, Language } from '../utils/Translations';

type Tone = 'directo' | 'empático' | 'motivador';
type Depth = 'breve' | 'normal' | 'profunda';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const currentLang = getLanguage();
  
  // Estado del perfil
  const [profile, setProfile] = useState<any>(null); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [currentRank, setCurrentRank] = useState<Rank>(Gamification.getCurrentRank(0));
  const [nextRank, setNextRank] = useState<Rank | null>(Gamification.getNextRank(0));
  const [progress, setProgress] = useState(0);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // IKIGAI States
  const [showIkigaiModal, setShowIkigaiModal] = useState(false);
  const [ikigaiInput, setIkigaiInput] = useState('');
  const [isGeneratingIkigai, setIsGeneratingIkigai] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);

  // Default Profile Schema to ensure all keys exist
  const DEFAULT_PROFILE = {
    name: 'viajero',
    ikigai: '',
    aiTone: 'directo' as Tone,
    aiDepth: 'normal' as Depth,
    isAnon: false,
    spiritualMode: false,
    darkMode: true,
    notifications: true,
    haptics: true,
    cloudSync: false,
    isPremium: false,
    wearableConnected: false,
    performanceMode: false,
    xp: 0,
    unlockedAchievements: []
  };

  // Load Profile Async
  useEffect(() => {
    const loadData = async () => {
        const data = await SyncManager.getProfile();
        // Merge with defaults to prevent "undefined" errors on new properties
        const mergedProfile = { ...DEFAULT_PROFILE, ...(data || {}) };
        
        setProfile(mergedProfile);
        updateRankStats(mergedProfile);
        setIsLoadingProfile(false);
    };
    loadData();
  }, []);

  const updateRankStats = (p: any) => {
    const xp = p?.xp || 0;
    setCurrentRank(Gamification.getCurrentRank(xp));
    setNextRank(Gamification.getNextRank(xp));
    setProgress(Gamification.getProgressToNext(xp));
  };

  useEffect(() => {
    if (!profile || isLoadingProfile) return;
    
    setSaveStatus('saving');
    
    // Save to Firestore via SyncManager
    SyncManager.saveProfile(profile);

    // Recalculate Rank Local
    updateRankStats(profile);

    const timer = setTimeout(() => {
        setSaveStatus('saved');
    }, 600);
    const timer2 = setTimeout(() => {
        setSaveStatus('idle');
    }, 2000);
    return () => { clearTimeout(timer); clearTimeout(timer2); };
  }, [profile]);

  const handleThemeToggle = () => {
      const newDarkMode = !profile.darkMode;
      setProfile((prev: any) => ({ ...prev, darkMode: newDarkMode }));
      if (newDarkMode) {
          document.documentElement.classList.remove('light-mode');
      } else {
          document.documentElement.classList.add('light-mode');
      }
  };

  const handlePerformanceToggle = () => {
      const newPerfMode = !profile.performanceMode;
      setProfile((prev: any) => ({ ...prev, performanceMode: newPerfMode }));
      if (newPerfMode) {
          document.documentElement.classList.add('performance-mode');
      } else {
          document.documentElement.classList.remove('performance-mode');
      }
  };

  const handleSpiritualToggle = () => {
      if (!profile.isPremium) {
          navigate('/premium');
          return;
      }
      setProfile((prev: any) => ({...prev, spiritualMode: !prev.spiritualMode}));
  };

  const handleWearableToggle = () => {
      // Simulate Connection
      const newState = !profile.wearableConnected;
      setProfile((prev: any) => ({...prev, wearableConnected: newState}));
      if(newState) {
          alert("Dispositivo sincronizado. Supra leerá tu variabilidad cardiaca (simulado).");
      }
  };

  const handleGenerateIkigai = async () => {
    if (!ikigaiInput.trim()) return;
    if (!QuotaManager.canAfford('ikigai')) {
        profile.isPremium ? alert("Has alcanzado el límite de seguridad diario.") : navigate('/premium');
        return;
    }
    setIsGeneratingIkigai(true);
    try {
        QuotaManager.consume('ikigai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `El usuario quiere descubrir su Ikigai. Usuario: "${ikigaiInput}". 
            Instrucciones: Analiza y destila la esencia en UNA frase poderosa, memorable y minimalista (máx 15 palabras).
            Tono: Serio, profundo, estoico. Formato: todo en minúsculas. Idioma de salida: ${currentLang === 'pt' ? 'Portugués' : currentLang === 'en' ? 'Inglés' : 'Español'}.`,
        });
        if (response.text) {
            setProfile((prev: any) => ({ ...prev, ikigai: response.text!.trim().toLowerCase() }));
            setShowIkigaiModal(false);
            setIkigaiInput('');
        }
    } catch (e) {
        console.error("Error generating Ikigai", e);
    } finally {
        setIsGeneratingIkigai(false);
    }
  };

  const handleExport = () => {
      if (!profile.isPremium) {
          navigate('/premium');
          return;
      }
      const exportData = {
          ...profile,
          exportDate: new Date().toISOString(),
          appVersion: '1.2.0'
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supra_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  if (isLoadingProfile || !profile) {
      return <div className="flex-1 bg-black flex items-center justify-center text-neutral-500 text-xs uppercase tracking-widest">cargando perfil...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        
        {/* Top Status */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
            <div className="size-10" />
            <div className="size-10 flex items-center justify-end">
                {saveStatus === 'saving' && <div className="size-2 rounded-full bg-white animate-ping" />}
                {saveStatus === 'saved' && <span className="material-symbols-outlined text-emerald-400 text-sm animate-in fade-in">check</span>}
            </div>
        </div>

        <div className="px-4 space-y-8">
            {/* Header */}
            <div>
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-500 mb-1 block ${saveStatus === 'saved' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {saveStatus === 'saving' ? t('profile.syncing') : t('profile.identity')}
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tighter">{t('profile.title')}</h1>
            </div>
            
            {/* --- BLOQUE 1: GAMIFICACIÓN & AVATAR --- */}
            <section className="relative">
                <div className="flex flex-col items-center p-6 rounded-[2.5rem] liquid-glass relative overflow-hidden group border-t border-white/10">
                    <div className={`absolute top-0 inset-x-0 h-32 opacity-20 bg-gradient-to-b from-${currentRank.color.replace('text-', '')} to-transparent pointer-events-none`} />
                    <div className="relative mb-4 cursor-pointer hover:scale-105 transition-transform duration-500">
                        <div className="size-28 rounded-full bg-gradient-to-tr from-neutral-800 to-black p-1.5 relative overflow-hidden shadow-2xl">
                            <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-30 animate-[spin_10s_linear_infinite] ${currentRank.color.replace('text', 'border')}`} />
                            {profile.isAnon ? (
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10">
                                    <span className="material-symbols-outlined text-4xl text-neutral-600">visibility_off</span>
                                </div>
                            ) : (
                                <img src={`https://picsum.photos/seed/${profile.name}/200/200`} className="w-full h-full object-cover rounded-full grayscale contrast-125" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                            <span className={`material-symbols-outlined text-sm ${currentRank.color} icon-filled`}>{currentRank.icon}</span>
                        </div>
                    </div>
                    <div className="text-center space-y-1 mb-6 z-10">
                        <input 
                            ref={nameInputRef}
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value.toLowerCase()})}
                            className="bg-transparent text-2xl font-bold text-white outline-none w-full text-center hover:bg-white/5 rounded transition-colors placeholder-neutral-600 tracking-tight lowercase"
                        />
                        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${currentRank.color} drop-shadow-md`}>
                            {t('profile.rank')} {currentRank.name}
                        </p>
                    </div>
                    <div className="w-full space-y-2 relative z-10">
                        <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                            <span>xp: {profile.xp}</span>
                            <span>{t('profile.next')}: {nextRank ? nextRank.name : 'max'}</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full transition-all duration-1000 ease-out ${currentRank.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BLOQUE 2: SALA DE TROFEOS --- */}
            <section className="space-y-4">
                <SectionHeader title={t('profile.trophies')} icon="emoji_events" />
                <div className="grid grid-cols-3 gap-3">
                    {ACHIEVEMENTS.map(ach => {
                        // FIX: Use optional chaining and default to empty array
                        const isUnlocked = (profile.unlockedAchievements || []).includes(ach.id);
                        return (
                            <div key={ach.id} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 p-2 transition-all relative overflow-hidden group ${isUnlocked ? 'bg-neutral-900 border-white/10 shadow-lg' : 'bg-black border-white/5 opacity-50 grayscale'}`}>
                                {isUnlocked && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />}
                                <span className={`material-symbols-outlined text-2xl ${isUnlocked ? 'text-white icon-filled drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-neutral-700'}`}>{ach.icon}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-wide text-center leading-tight ${isUnlocked ? 'text-neutral-300' : 'text-neutral-700'}`}>{ach.title}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* IKIGAI */}
            <div className="relative rounded-[2rem] liquid-glass p-6 transition-all focus-within:bg-white/5 hover:bg-white/5 border border-purple-500/10">
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400 text-sm drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">explore</span>
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-purple-200 font-bold">{t('profile.ikigai_title')}</h3>
                    </div>
                    <button onClick={() => setShowIkigaiModal(true)} className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>ia
                    </button>
                </div>
                <textarea 
                    value={profile.ikigai || ''}
                    onChange={(e) => setProfile({...profile, ikigai: e.target.value})}
                    placeholder={t('profile.ikigai_placeholder')}
                    maxLength={140}
                    className="w-full bg-transparent border-none text-white text-lg font-serif italic leading-relaxed outline-none resize-none placeholder-neutral-600 h-24 relative z-10 selection:bg-purple-500/30 lowercase"
                />
            </div>

            {/* PREFERENCIAS DEL SISTEMA */}
            <section className="space-y-4">
                <SectionHeader title={t('profile.system')} icon="settings_suggest" />
                <div className="liquid-glass rounded-3xl overflow-hidden border border-white/5">
                    <ToggleRow 
                        icon={profile.darkMode ? "dark_mode" : "light_mode"}
                        label={t('profile.dark_mode')} 
                        sublabel={profile.darkMode ? t('profile.dark_desc') : t('profile.light_desc')} 
                        active={profile.darkMode} 
                        onToggle={handleThemeToggle} 
                    />
                    <div className="h-px bg-white/5 mx-4" />
                    
                    {/* PERFORMANCE MODE TOGGLE */}
                    <ToggleRow 
                        icon="speed"
                        label="modo rendimiento" 
                        sublabel={profile.performanceMode ? "sin transparencias (máx fps)" : "efectos visuales completos"} 
                        active={profile.performanceMode} 
                        onToggle={handlePerformanceToggle} 
                    />
                    <div className="h-px bg-white/5 mx-4" />

                    {/* TONAL FILTER TOGGLE */}
                    <ToggleRow 
                        icon={profile.spiritualMode ? "wb_sunny" : "balance"}
                        label="filtro tonal: lux" 
                        sublabel={profile.spiritualMode ? "enfocado en gratitud y providencia" : "enfocado en disciplina estoica"} 
                        active={profile.spiritualMode} 
                        isLocked={!profile.isPremium}
                        onToggle={handleSpiritualToggle} 
                    />
                     <div className="h-px bg-white/5 mx-4" />
                     {/* WEARABLE INTEGRATION (SIMULATED) */}
                     <ToggleRow 
                        icon="watch"
                        label="bio-sync" 
                        sublabel={profile.wearableConnected ? "apple watch / garmin conectado" : "sincronizar wearables"} 
                        active={profile.wearableConnected} 
                        onToggle={handleWearableToggle} 
                    />
                     <div className="h-px bg-white/5 mx-4" />
                    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setShowLangSelector(!showLangSelector)}>
                        <div className="flex items-center gap-4">
                             <div className="size-8 rounded-full bg-white/5 text-neutral-500 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">translate</span>
                             </div>
                             <div>
                                <p className="text-sm font-bold text-neutral-400 transition-colors group-hover:text-white">{t('profile.language')}</p>
                                <p className="text-[10px] text-neutral-600 mt-0.5 font-medium uppercase tracking-wide">
                                    {currentLang === 'es' ? 'español' : currentLang === 'en' ? 'english' : 'português'}
                                </p>
                             </div>
                        </div>
                        <span className="material-symbols-outlined text-neutral-500">expand_more</span>
                    </div>

                    {showLangSelector && (
                        <div className="bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2">
                             <button onClick={() => setLanguage('es')} className={`w-full text-left px-16 py-3 text-xs font-bold uppercase tracking-widest ${currentLang === 'es' ? 'text-white' : 'text-neutral-500'} hover:text-white`}>español</button>
                             <button onClick={() => setLanguage('en')} className={`w-full text-left px-16 py-3 text-xs font-bold uppercase tracking-widest ${currentLang === 'en' ? 'text-white' : 'text-neutral-500'} hover:text-white`}>english</button>
                             <button onClick={() => setLanguage('pt')} className={`w-full text-left px-16 py-3 text-xs font-bold uppercase tracking-widest ${currentLang === 'pt' ? 'text-white' : 'text-neutral-500'} hover:text-white`}>português</button>
                        </div>
                    )}
                </div>
            </section>

            {/* DATA MANAGEMENT */}
            <section className="space-y-4 pt-2">
                <button onClick={() => handleExport()} className="w-full liquid-glass rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group hover:bg-white/5 relative overflow-hidden">
                     {!profile.isPremium && <div className="absolute right-4 top-4 z-10"><span className="material-symbols-outlined text-amber-500 text-sm">lock</span></div>}
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                            <span className="material-symbols-outlined text-neutral-400 text-xl group-hover:text-white transition-colors">download</span>
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-bold text-white block">{t('profile.export')}</span>
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">json / csv format</span>
                        </div>
                    </div>
                </button>
            </section>

             {/* PREMIUM BANNER */}
            <section onClick={() => navigate('/premium')} className="relative overflow-hidden rounded-[2rem] p-1 mt-4 cursor-pointer group active:scale-[0.98] transition-transform">
                <div className={`absolute inset-0 bg-gradient-to-r ${profile.isPremium ? 'from-white via-neutral-200 to-neutral-400' : 'from-neutral-800 to-neutral-900'}`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="relative z-10 p-6 flex items-center justify-between">
                    <div>
                        <h3 className={`text-lg font-bold italic font-serif ${profile.isPremium ? 'text-black' : 'text-white'}`}>supra black</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${profile.isPremium ? 'text-neutral-700' : 'text-neutral-400'}`}>
                            {profile.isPremium ? 'miembro fundador' : 'plan actual: gratuito'}
                        </p>
                    </div>
                    <button className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-transform ${profile.isPremium ? 'bg-black text-white' : 'bg-white text-black group-hover:scale-105'}`}>
                        {profile.isPremium ? t('profile.manage') : t('profile.upgrade')}
                    </button>
                </div>
            </section>

            <footer className="pt-8 pb-4 flex flex-col items-center gap-4 opacity-40">
                <div className="flex gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <button onClick={() => navigate('/support')} className="hover:text-white">soporte</button>
                    <button onClick={() => navigate('/terms')} className="hover:text-white">términos</button>
                    <button onClick={() => navigate('/privacy-policy')} className="hover:text-white">privacidad</button>
                </div>
                <span className="text-[9px] text-neutral-700">v1.4.0 (firestore sync)</span>
            </footer>
            <div className="h-10" />
        </div>
      </div>

      {/* MODAL IA */}
      {showIkigaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300">
              <div className="w-full max-w-sm liquid-glass-heavy rounded-[2.5rem] p-8 relative overflow-hidden">
                  <button onClick={() => setShowIkigaiModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white">
                      <span className="material-symbols-outlined">close</span>
                  </button>
                  <div className="space-y-6">
                      <div className="size-16 rounded-full bg-gradient-to-tr from-purple-900 to-blue-900 flex items-center justify-center mb-2 mx-auto shadow-[0_0_30px_rgba(88,28,135,0.4)]">
                          <span className="material-symbols-outlined text-3xl text-white">auto_awesome</span>
                      </div>
                      <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-white tracking-tight">la forja de propósito</h3>
                          <p className="text-neutral-400 text-sm leading-relaxed">responde brevemente: ¿qué actividad te hace perder la noción del tiempo y sentirte útil?</p>
                      </div>
                      <textarea 
                          value={ikigaiInput}
                          onChange={(e) => setIkigaiInput(e.target.value)}
                          placeholder="ej: resolver problemas complejos..."
                          className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-neutral-600 border border-white/5 outline-none focus:border-purple-500/50 transition-colors resize-none text-sm lowercase"
                      />
                      <button 
                          onClick={handleGenerateIkigai}
                          disabled={isGeneratingIkigai || !ikigaiInput.trim()}
                          className="w-full h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isGeneratingIkigai ? <span>forjando...</span> : <span>descubrir</span>}
                      </button>
                  </div>
              </div>
          </div>
      )}
      <BottomNav />
    </div>
  );
};

const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
    <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-neutral-600 text-lg">{icon}</span>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold">{title}</h3>
    </div>
);

const ToggleRow = ({ icon, label, sublabel, active, onToggle, isLocked }: { icon: string, label: string, sublabel?: string, active: boolean, onToggle: () => void, isLocked?: boolean }) => (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
             <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-white text-black' : 'bg-white/5 text-neutral-500'}`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
             </div>
             <div>
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold transition-colors ${active ? 'text-white' : 'text-neutral-400'}`}>{label}</p>
                    {isLocked && <span className="material-symbols-outlined text-xs text-amber-500">lock</span>}
                </div>
                {sublabel && <p className="text-[10px] text-neutral-600 mt-0.5 font-medium uppercase tracking-wide">{sublabel}</p>}
             </div>
        </div>
        <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-emerald-500' : 'bg-neutral-800 border border-white/10'}`}>
            <div className={`absolute top-0.5 size-5 rounded-full transition-all duration-300 shadow-sm ${active ? 'left-5 bg-white' : 'left-0.5 bg-neutral-500'}`} />
        </div>
    </div>
);

export default Privacy;
