
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import BottomNav from '../components/BottomNav';

// Definición de tipos para el caché
interface CachedQuote {
  text: string;
  source: string;
  slot: 'morning' | 'afternoon' | 'night';
  timestamp: number;
  mode: 'stoic' | 'spiritual';
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
  const [userName, setUserName] = useState('alex');

  useEffect(() => {
    // 1. Configurar Saludo y Fecha
    const hours = new Date().getHours();
    let currentSlot: 'morning' | 'afternoon' | 'night' = 'morning';

    if (hours < 12) {
        setGreeting('buenos días');
        currentSlot = 'morning';
    } else if (hours < 20) {
        setGreeting('buenas tardes');
        currentSlot = 'afternoon';
    } else {
        setGreeting('buenas noches');
        currentSlot = 'night';
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('es-ES', options).toLowerCase());

    // 2. Cargar Perfil
    const savedProfileStr = localStorage.getItem('supra_profile');
    let profileGoals = ['disciplina', 'foco']; // Default goals
    let spiritualMode = false;
    let name = 'alex';

    if (savedProfileStr) {
        const profile = JSON.parse(savedProfileStr);
        spiritualMode = profile.spiritualMode || false;
        name = profile.name || 'alex';
    }
    
    setIsSpiritual(spiritualMode);
    setUserName(name);

    // 3. Lógica de "Smart Caching" para la Frase
    const cachedDataStr = localStorage.getItem('supra_smart_quote');
    let shouldFetch = true;

    if (cachedDataStr) {
        const cached: CachedQuote = JSON.parse(cachedDataStr);
        const isSameSlot = cached.slot === currentSlot;
        const isSameMode = cached.mode === (spiritualMode ? 'spiritual' : 'stoic');
        const isToday = new Date(cached.timestamp).getDate() === new Date().getDate();

        if (isSameSlot && isSameMode && isToday) {
            setQuote(cached.text);
            setQuoteSource(cached.source);
            setLoadingQuote(false);
            shouldFetch = false;
        }
    }

    // 4. Si no hay caché válido, generamos una nueva
    if (shouldFetch) {
        generateSmartQuote(spiritualMode, currentSlot, profileGoals);
    }

  }, []);

  const generateSmartQuote = async (spiritualMode: boolean, slot: string, goals: string[]) => {
    setLoadingQuote(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Contexto Temporal Dinámico
        let timeContext = "";
        if (slot === 'morning') timeContext = "Es por la mañana. El usuario necesita enfoque, energía, propósito y claridad para empezar el día.";
        if (slot === 'afternoon') timeContext = "Es por la tarde. El usuario puede estar cansado. Necesita resiliencia, fuerza, empuje y resistencia al estrés.";
        if (slot === 'night') timeContext = "Es de noche. El usuario necesita calma, reflexión, gratitud y desconexión para descansar.";

        // Contexto Personal
        const userContext = `Objetivos del usuario: ${goals.join(', ')}. ${timeContext}`;
        
        let promptInstruction = '';
        let modelConfig: any = {};

        if (spiritualMode) {
            // Modo Espiritual (JSON)
            promptInstruction = `Contexto: "${userContext}". Genera un VERSÍCULO BÍBLICO específico para este momento del día.
            Responde EXCLUSIVAMENTE JSON:
            {
                "verse": "texto breve en minúsculas (salvo Dios/Jesús)",
                "reference": "libro cap:vers (minúsculas)"
            }`;
            modelConfig = { responseMimeType: 'application/json' };
        } else {
            // Modo Estoico (Texto)
            promptInstruction = `Contexto: "${userContext}". Genera una frase filosófica estoica (Marco Aurelio, Séneca, Epicteto) o de psicología moderna.
            Requisitos: Máximo 12 palabras. Impactante. Directa.
            Formato: Solo el texto de la frase en minúsculas. Sin comillas. Sin autor en el texto.`;
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
            mode: spiritualMode ? 'spiritual' : 'stoic'
        };
        localStorage.setItem('supra_smart_quote', JSON.stringify(cacheData));

    } catch (error) {
        console.error("Error generating quote", error);
        setQuote("el obstáculo es el camino.");
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
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{dateStr}</p>
                <h1 className="text-4xl font-semibold text-white tracking-tighter leading-[1.1]">
                    {greeting}, <br/>
                    <span className="text-white/60">{userName}.</span>
                </h1>
            </div>
            
            {/* Racha Minimalista */}
            <div 
                onClick={() => navigate('/challenges')}
                className="liquid-glass px-4 py-2 rounded-full flex items-center gap-2 border border-orange-500/20 bg-orange-500/5 active:scale-95 transition-transform cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            >
                 <span className="material-symbols-outlined text-orange-500 text-xl icon-filled animate-pulse">local_fire_department</span>
                 <span className="text-lg font-bold text-white tabular-nums leading-none pt-0.5">12</span>
            </div>
        </header>

        {/* BLOQUE 2: ACCIÓN PRINCIPAL (Main CTA) */}
        <section className="mb-8">
            <button 
                onClick={() => navigate('/tracker')}
                className="group relative w-full h-36 bg-white rounded-[2.2rem] p-8 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-300"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 size-32 bg-neutral-100 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
                
                <div className="relative z-10 flex justify-between items-start w-full">
                    <div className="flex flex-col items-start space-y-2">
                        <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-bold uppercase tracking-widest">prioridad</span>
                        <h2 className="text-2xl font-bold text-black tracking-tight leading-none lowercase">sincronizar<br/>mente</h2>
                    </div>
                    <div className="size-10 rounded-full bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-xl">arrow_outward</span>
                    </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-neutral-500">
                    <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                    <span className="text-xs font-medium tracking-wide lowercase">registro de estado pendiente</span>
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
                        reset sistema nervioso
                    </h3>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed mb-6 max-w-[90%] lowercase">
                        tu historial muestra picos de estrés. hackea tu nervio vago en 3 minutos.
                    </p>

                    <button 
                        onClick={() => navigate('/meditation')}
                        className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <span className="text-xs font-bold text-white uppercase tracking-widest">calmar mente</span>
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
                                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-[0.2em]">pausa espiritual</span>
                             </div>
                             <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-bold text-amber-100 uppercase tracking-widest">
                                 modo lux
                             </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white tracking-tight mb-2 lowercase">
                            pausa de rendición
                        </h3>
                        <p className="text-sm text-amber-100/70 font-medium leading-relaxed mb-6 max-w-[95%] lowercase">
                            neuro-teología aplicada. suelta el control y descansa en la providencia.
                        </p>

                        <button 
                            onClick={() => navigate('/prayer')}
                            className="w-full py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        >
                            <span className="text-xs font-bold text-white uppercase tracking-widest">iniciar oración</span>
                            <span className="material-symbols-outlined text-xs text-white">spa</span>
                        </button>
                    </div>
                </div>
            </section>
        )}

        {/* BLOQUE 4: FRASE DEL DÍA (Ahora con fondo animado continuo) */}
        <section className="mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="liquid-glass rounded-[2rem] p-1 overflow-hidden shadow-2xl group relative">
                
                {/* Continuous Moving Background Gradient */}
                <div className={`absolute inset-0 animate-gradient-x pointer-events-none opacity-30 ${
                    isSpiritual 
                    ? 'bg-gradient-to-r from-amber-800/40 via-purple-900/40 to-amber-800/40' 
                    : 'bg-gradient-to-r from-indigo-900/40 via-neutral-900/40 to-indigo-900/40'
                }`} />
                
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

                {/* Decorative Blur Spot */}
                <div className={`absolute -top-10 -left-10 size-40 rounded-full blur-[50px] pointer-events-none ${isSpiritual ? 'bg-amber-500/20' : 'bg-blue-900/30'}`} />

                <div className="relative z-10 p-6 min-h-[140px] flex flex-col items-center justify-center text-center space-y-4 w-full">
                    {/* Header */}
                    <div className="flex items-center gap-2 opacity-60">
                         <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/50" />
                         <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em]">
                            {isSpiritual ? 'maná diario' : 'filosofía activa'}
                         </span>
                         <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/50" />
                    </div>
                    
                    {/* Content */}
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

      <BottomNav />
    </div>
  );
};

export default Dashboard;
