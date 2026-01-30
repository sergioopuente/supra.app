
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import BottomNav from '../components/BottomNav';
import { QuotaManager } from '../utils/QuotaManager';
import { getLanguage, t } from '../utils/Translations';
import { SyncManager } from '../utils/SyncManager';
import { isFirebaseActive } from '../utils/Firebase';

// Definición de tipos para el caché
interface CachedQuote {
  text: string;
  source: string;
  slot: 'morning' | 'afternoon' | 'night';
  timestamp: number;
  mode: 'stoic' | 'spiritual';
  language: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');
  
  // Estado de la frase
  const [quote, setQuote] = useState(''); 
  const [quoteSource, setQuoteSource] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(true);
  
  // Perfil y Preferencias
  const [isSpiritual, setIsSpiritual] = useState(false);
  const [userName, setUserName] = useState('viajero');
  const [userGoal, setUserGoal] = useState('disciplina');
  
  // ENERGY STATE
  const [energy, setEnergy] = useState(100);
  
  // DAILY MOMENT STATE
  const [showDailyMoment, setShowDailyMoment] = useState(false);
  const [dailyMomentText, setDailyMomentText] = useState('');
  const [isPlayingMoment, setIsPlayingMoment] = useState(false);

  const currentLang = getLanguage();

  useEffect(() => {
    // 1. Configurar Saludo y Fecha
    const hours = new Date().getHours();
    let currentSlot: 'morning' | 'afternoon' | 'night' = 'morning';

    if (hours < 12) {
        setGreeting(t('dashboard.greeting.morning'));
        currentSlot = 'morning';
    } else if (hours < 20) {
        setGreeting(t('dashboard.greeting.afternoon'));
        currentSlot = 'afternoon';
    } else {
        setGreeting(t('dashboard.greeting.night'));
        currentSlot = 'night';
    }

    const localeMap = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString(localeMap[currentLang], options).toLowerCase());

    // 2. Cargar Perfil (ASYNC REPLACEMENT)
    const loadProfile = async () => {
        const profile = await SyncManager.getProfile();
        
        let profileGoals = ['disciplina']; 
        let spiritualMode = false;
        let name = 'viajero';

        if (profile) {
            spiritualMode = profile.spiritualMode || false;
            name = profile.name || 'viajero';
            if (profile.goals && profile.goals.length > 0) {
                profileGoals = profile.goals;
                setUserGoal(profile.goals[0]);
            }
        }
        
        setIsSpiritual(spiritualMode);
        setUserName(name);

        // 3. Lógica de "Smart Caching" para la Frase (Depende de perfil cargado)
        const cachedDataStr = localStorage.getItem('supra_smart_quote');
        let shouldFetch = true;

        if (cachedDataStr) {
            const cached: CachedQuote = JSON.parse(cachedDataStr);
            const isSameSlot = cached.slot === currentSlot;
            const isSameMode = cached.mode === (spiritualMode ? 'spiritual' : 'stoic');
            const isSameLang = cached.language === currentLang;
            const isToday = new Date(cached.timestamp).getDate() === new Date().getDate();

            if (isSameSlot && isSameMode && isToday && isSameLang) {
                setQuote(cached.text);
                setQuoteSource(cached.source);
                setLoadingQuote(false);
                shouldFetch = false;
            }
        }

        if (shouldFetch) {
            generateSmartQuote(spiritualMode, currentSlot, profileGoals, currentLang);
        }

        // 5. CHECK DAILY MOMENT (Killer Feature)
        checkDailyMoment(currentSlot, profileGoals, name, spiritualMode, currentLang);
    };
    loadProfile();

    // 6. Energy Listener
    const updateEnergy = () => setEnergy(QuotaManager.getEnergy());
    updateEnergy(); // Init
    window.addEventListener('energy_update', updateEnergy);
    return () => window.removeEventListener('energy_update', updateEnergy);

  }, [currentLang]);

  const checkDailyMoment = async (slot: string, goals: string[], name: string, isLux: boolean, lang: string) => {
      const todayKey = new Date().toDateString(); // "Mon Feb 24 2025"
      const lastSeen = localStorage.getItem('supra_last_daily_moment_date');

      // Solo mostramos si NO se ha visto hoy
      if (lastSeen !== todayKey) {
          // Pequeño delay para que la UI cargue primero
          await new Promise(r => setTimeout(r, 1500));
          
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const langName = lang === 'pt' ? 'Portugués' : lang === 'en' ? 'Inglés' : 'Español';
              
              const prompt = `Genera una "Micro-Misión Supra" para el usuario ${name}.
              Contexto: Es ${slot}. Objetivo: ${goals[0]}. Modo: ${isLux ? 'Espiritual/Gratitud' : 'Estoico/Disciplina'}.
              Instrucción: Dame una sola frase imperativa, corta y poderosa (máx 15 palabras) que sea una acción mental inmediata.
              Ejemplo Mañana: "no mires el móvil, bebe agua y define una sola meta."
              Ejemplo Tarde: "endereza la espalda y respira, aún queda batalla."
              Ejemplo Noche: "suelta el control, mañana será otro día."
              Salida: Solo el texto en minúsculas. Idioma: ${langName}.`;

              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt
              });

              if (response.text) {
                  setDailyMomentText(response.text.trim());
                  setShowDailyMoment(true);
                  // Marcar como visto HOY (incluso si cierra el modal sin leer, para no spammear)
                  localStorage.setItem('supra_last_daily_moment_date', todayKey); 
              }
          } catch (e) {
              console.error("Moment generation failed", e);
          }
      }
  };

  const handlePlayMoment = () => {
      if (!dailyMomentText) return;
      setIsPlayingMoment(true);
      const u = new SpeechSynthesisUtterance(dailyMomentText);
      u.lang = currentLang === 'es' ? 'es-ES' : currentLang === 'en' ? 'en-US' : 'pt-BR';
      u.rate = 0.9;
      u.onend = () => setIsPlayingMoment(false);
      window.speechSynthesis.speak(u);
  };

  const generateSmartQuote = async (spiritualMode: boolean, slot: string, goals: string[], lang: string) => {
    setLoadingQuote(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const langName = lang === 'pt' ? 'Portuguese' : lang === 'en' ? 'English' : 'Spanish';
        
        // Contexto Temporal Dinámico
        let timeContext = "";
        if (slot === 'morning') timeContext = "Mañana: Foco, propósito, inicio.";
        if (slot === 'afternoon') timeContext = "Tarde: Resiliencia, persistencia.";
        if (slot === 'night') timeContext = "Noche: Calma, gratitud, desconexión.";

        // Contexto Personal
        const userContext = `Objetivo: ${goals.join(', ')}. ${timeContext}`;
        
        let promptInstruction = '';
        let modelConfig: any = {};

        if (spiritualMode) {
            // Modo Espiritual (JSON)
            promptInstruction = `Contexto: "${userContext}". Genera un VERSÍCULO BÍBLICO para ahora.
            Idioma de salida: ${langName}.
            Responde JSON: { "verse": "texto breve minúsculas", "reference": "libro cap:vers" }`;
            modelConfig = { responseMimeType: 'application/json' };
        } else {
            // Modo Estoico (Texto)
            promptInstruction = `Contexto: "${userContext}". Genera una frase estoica (Marco Aurelio, Séneca, Epicteto) o motivacional oscura.
            Requisitos: Máximo 12 palabras. Impactante. Directa. Idioma de salida: ${langName}.
            Formato: Solo el texto en minúsculas.`;
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: promptInstruction,
            config: modelConfig
        });

        let newText = '';
        let newSource = '';

        if (response.text) {
            if (spiritualMode) {
                try {
                    const json = JSON.parse(response.text);
                    newText = json.verse;
                    newSource = json.reference;
                } catch (e) {
                    newText = response.text;
                }
            } else {
                newText = response.text.trim().toLowerCase();
                const authors = ['marco aurelio', 'séneca', 'epicteto', 'ryan holiday'];
                newSource = authors[Math.floor(Math.random() * authors.length)];
            }
        }

        setQuote(newText);
        setQuoteSource(newSource);

        const cacheData: CachedQuote = {
            text: newText,
            source: newSource,
            slot: slot as any,
            timestamp: Date.now(),
            mode: spiritualMode ? 'spiritual' : 'stoic',
            language: lang
        };
        localStorage.setItem('supra_smart_quote', JSON.stringify(cacheData));

    } catch (error) {
        console.error("Error generating quote", error);
        setQuote(lang === 'pt' ? "o obstáculo é o caminho." : lang === 'en' ? "the obstacle is the way." : "el obstáculo es el camino.");
        setQuoteSource("séneca");
    } finally {
        setLoadingQuote(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative page-transition font-sans selection:bg-white selection:text-black">
      
      {/* 0. CAPA ATMOSFÉRICA (VIDEO BG) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none scale-105"
      >
        <source src="https://cdn.pixabay.com/video/2020/05/25/40149-424078833_large.mp4" type="video/mp4" />
      </video>

      {/* Gradiente de legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 z-0 pointer-events-none" />

      {/* CONTENIDO PRINCIPAL - CENTRO DE MANDO */}
      <div className="flex-1 flex flex-col relative z-10 px-6 pt-14 pb-32 overflow-y-auto no-scrollbar">
        
        {/* BLOQUE 1: CONTEXTO HUMANO & RACHA */}
        <header className="flex justify-between items-start mb-10">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{dateStr}</p>
                    {/* Firebase Status Badge */}
                    <span className={`size-1.5 rounded-full ${isFirebaseActive ? 'bg-emerald-500' : 'bg-neutral-600'}`} 
                        title={isFirebaseActive ? 'Nube Activa' : 'Modo Local'} 
                    />
                </div>
                <h1 className="text-4xl font-semibold text-white tracking-tighter leading-[1.1]">
                    {greeting}, <br/>
                    <span className="text-white/60">{userName}.</span>
                </h1>
            </div>
            
            {/* Energy Battery & Racha */}
            <div className="flex flex-col items-end gap-2">
                {/* Mental Battery */}
                <div onClick={() => !QuotaManager.isPremium() && navigate('/premium')} className="flex items-center gap-1.5 cursor-pointer group">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${energy < 20 ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`}>
                        {QuotaManager.isPremium() ? '∞' : `${energy}%`}
                    </span>
                    <div className={`w-6 h-3 rounded border ${energy < 20 ? 'border-red-500/50' : 'border-white/20'} p-0.5 relative`}>
                        <div 
                            className={`h-full rounded-[1px] transition-all duration-500 ${
                                energy > 50 ? 'bg-emerald-400' : energy > 20 ? 'bg-amber-400' : 'bg-red-500'
                            }`} 
                            style={{ width: `${energy}%` }} 
                        />
                        <div className="absolute -right-[3px] top-[2px] h-1.5 w-[2px] bg-white/20 rounded-r-sm" />
                    </div>
                </div>

                {/* Racha Minimalista */}
                <div 
                    onClick={() => navigate('/challenges')}
                    className="liquid-glass px-4 py-2 rounded-full flex items-center gap-2 border border-orange-500/20 bg-orange-500/5 active:scale-95 transition-transform cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                >
                    <span className="material-symbols-outlined text-orange-500 text-xl icon-filled animate-pulse">local_fire_department</span>
                    <span className="text-lg font-bold text-white tabular-nums leading-none pt-0.5">12</span>
                </div>
            </div>
        </header>

        {/* BLOQUE 2: ACCIÓN PRINCIPAL (Contextual) */}
        <section className="mb-8">
            <button 
                onClick={() => navigate('/tracker')}
                className="group relative w-full h-36 bg-white rounded-[2.2rem] p-8 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-300"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 size-32 bg-neutral-100 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
                
                <div className="relative z-10 flex justify-between items-start w-full">
                    <div className="flex flex-col items-start space-y-2">
                        <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-bold uppercase tracking-widest">{t('dashboard.priority')}: {userGoal}</span>
                        <h2 className="text-2xl font-bold text-black tracking-tight leading-none lowercase whitespace-pre-line">{t('dashboard.sync_mind')}</h2>
                    </div>
                    <div className="size-10 rounded-full bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-xl">arrow_outward</span>
                    </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-neutral-500">
                    <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                    <span className="text-xs font-medium tracking-wide lowercase">{t('dashboard.pending')}</span>
                </div>
            </button>
        </section>

        {/* BLOQUE 3.1: MEDITACIÓN (Siempre visible como base científica) */}
        <section className="mb-4">
            <div className="liquid-glass rounded-[2rem] p-1 overflow-hidden relative group">
                {/* Continuous Moving Background Gradient - Cyan Theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-cyan-500/20 animate-gradient-x pointer-events-none" />
                
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-cyan-300 text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            self_improvement
                        </span>
                        <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-[0.2em]">regulación mental</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2 lowercase">
                        {t('dashboard.meditation_title')}
                    </h3>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed mb-6 max-w-[90%] lowercase">
                        {t('dashboard.meditation_desc')}
                    </p>

                    <button 
                        onClick={() => navigate('/meditation')}
                        className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{t('dashboard.meditation_btn')}</span>
                        <span className="material-symbols-outlined text-xs text-white">play_arrow</span>
                    </button>
                </div>
            </div>
        </section>

        {/* BLOQUE 3.2: ORACIÓN (Solo Modo Lux - Visible debajo de la meditación) */}
        {isSpiritual && (
            <section className="mb-6 animate-in slide-in-from-bottom-8 duration-500 delay-100">
                <div className="liquid-glass rounded-[2rem] p-1 overflow-hidden relative group">
                    {/* Continuous Moving Background Gradient - Amber Theme */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-amber-600/20 animate-gradient-x pointer-events-none" />
                    
                    <div className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-300 text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                    volunteer_activism
                                </span>
                                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-[0.2em]">{t('profile.lux_mode')}</span>
                             </div>
                             <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-bold text-amber-100 uppercase tracking-widest">
                                 {t('profile.lux_mode')}
                             </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white tracking-tight mb-2 lowercase">
                            {t('dashboard.prayer_title')}
                        </h3>
                        <p className="text-sm text-amber-100/70 font-medium leading-relaxed mb-6 max-w-[95%] lowercase">
                            {t('dashboard.prayer_desc')}
                        </p>

                        <button 
                            onClick={() => navigate('/prayer')}
                            className="w-full py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        >
                            <span className="text-xs font-bold text-white uppercase tracking-widest">{t('dashboard.prayer_btn')}</span>
                            <span className="material-symbols-outlined text-xs text-white">spa</span>
                        </button>
                    </div>
                </div>
            </section>
        )}

        {/* BLOQUE 4: FRASE DEL DÍA */}
        <section className="mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="liquid-glass rounded-[2rem] p-1 overflow-hidden shadow-2xl group relative">
                
                <div className={`absolute inset-0 animate-gradient-x pointer-events-none opacity-30 ${
                    isSpiritual 
                    ? 'bg-gradient-to-r from-amber-800/40 via-purple-900/40 to-amber-800/40' 
                    : 'bg-gradient-to-r from-indigo-900/40 via-neutral-900/40 to-indigo-900/40'
                }`} />
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

                <div className={`absolute -top-10 -left-10 size-40 rounded-full blur-[50px] pointer-events-none ${isSpiritual ? 'bg-amber-500/20' : 'bg-blue-900/30'}`} />

                <div className="relative z-10 p-6 min-h-[140px] flex flex-col items-center justify-center text-center space-y-4 w-full">
                    <div className="flex items-center gap-2 opacity-60">
                         <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/50" />
                         <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em]">
                            {isSpiritual ? t('dashboard.spiritual_label') : t('dashboard.quote_label')}
                         </span>
                         <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/50" />
                    </div>
                    
                    <div className={`transition-opacity duration-700 flex flex-col items-center gap-3 w-full ${loadingQuote ? 'opacity-0' : 'opacity-100'}`}>
                        {quote ? (
                            <>
                                <p className="text-xl font-serif italic text-white/90 leading-relaxed max-w-[95%]">
                                    "{quote}"
                                </p>
                                {quoteSource && (
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        {quoteSource}
                                    </span>
                                )}
                            </>
                        ) : (
                             <div className="h-10 w-full" />
                        )}
                    </div>

                    {loadingQuote && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-5 border-2 border-white/10 border-t-white rounded-full animate-spin"/>
                        </div>
                    )}
                </div>
             </div>
        </section>

      </div>
      
      {/* --- DAILY MOMENT MODAL (KILLER FEATURE) --- */}
      {showDailyMoment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
              <div className="w-full max-w-sm relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
                  
                  <div className="relative bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                      
                      <div className="size-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 p-[1px] mb-6 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                          <div className="size-full bg-black rounded-full flex items-center justify-center">
                               <span className="material-symbols-outlined text-3xl text-white">auto_awesome</span>
                          </div>
                      </div>

                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-4">momento supra</span>
                      
                      <p className="text-xl font-medium text-white leading-relaxed mb-8 lowercase">
                          "{dailyMomentText}"
                      </p>

                      <div className="flex gap-3 w-full">
                          <button 
                             onClick={handlePlayMoment}
                             disabled={isPlayingMoment}
                             className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white"
                          >
                              <span className={`material-symbols-outlined ${isPlayingMoment ? 'animate-pulse text-purple-400' : ''}`}>
                                  {isPlayingMoment ? 'graphic_eq' : 'volume_up'}
                              </span>
                          </button>
                          
                          <button 
                            onClick={() => setShowDailyMoment(false)}
                            className="flex-1 h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center shadow-lg active:scale-95 transition-all"
                          >
                              integrar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;
