
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality } from '@google/genai';

// --- UTILITIES FOR GEMINI AUDIO DECODING ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Raw PCM (Int16) to AudioBuffer (Float32)
async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Normalize Int16 to Float32 [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
// -------------------------------------------

const FULL_SCRIPT = `
Hola hermano. Vamos a hacer una pausa de rendición. Sé que tu mente quiere resolverlo todo ahora mismo, pero tu cerebro necesita oxígeno, y tu alma necesita paz. Confía en mí por tres minutos.
[PAUSA]
Primero, vamos a regular tu biología. En la tradición antigua, al aliento se le llamaba Ruah, el espíritu de vida. No es solo aire, es presencia. Inhala profundo por la nariz en cuatro segundos... sostén el aire... y exhala lentamente en ocho. Al soltar el aire, imagina que sueltas el control. Inhala Ruah... exhala preocupación. Tu sistema nervioso está a salvo aquí.
[PAUSA]
Ahora, con la mente más clara, busca un pequeño destello de luz en tu día. No tiene que ser algo grande. Un café, un mensaje, un rayo de sol. Eso es la Providencia actuando en lo ordinario. Agradécelo. Dilo internamente: gracias por este detalle. Entrena a tu cerebro para ver la mano de Dios en el caos.
[PAUSA]
Finalmente, el paso más valiente: la entrega radical. Visualiza ese problema que te roba la paz. Tómalo en tus manos mentales... y suéltalo hacia arriba. No te corresponde cargarlo todo. Repite conmigo en tu mente: Jesús, en ti confío. Hágase tu voluntad, no mi ansiedad. Eres libre. Vuelve a tu día con esta paz.
`;

const PHASES = [
  {
    id: 1,
    title: "el aliento (ruah)",
    guide: "regulación fisiológica",
    subtext: "inhala vida divina en 4... exhala el control humano en 8...",
    duration: 60,
    type: 'breathing' 
  },
  {
    id: 2,
    title: "examen de luz",
    guide: "gratitud cognitiva",
    subtext: "encuentra la providencia en un detalle pequeño de hoy.",
    duration: 60,
    type: 'gratitude'
  },
  {
    id: 3,
    title: "entrega radical",
    guide: "confianza total",
    subtext: "suelta lo que no puedes controlar. descansa en Él.",
    duration: 60,
    type: 'surrender'
  }
];

const PrayerSession: React.FC = () => {
  const navigate = useNavigate();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio State
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isLoadingVoice, setIsLoadingVoice] = useState(true);
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // 1. Initialize Audio Context
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(ctx);

    // 2. Generate Neural Audio
    const generateVoice = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Clean script for TTS
            const cleanScript = FULL_SCRIPT.replace(/\[PAUSA\]/g, " ... ... ");

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: cleanScript }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is deep and calming
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                const rawBytes = base64ToUint8Array(base64Audio);
                const buffer = await pcmToAudioBuffer(rawBytes, ctx);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
                
                // Start suspended, user must play
                await ctx.suspend();
                setIsLoadingVoice(false);
            } else {
                throw new Error("No audio data returned");
            }
        } catch (error) {
            console.error("Error generating neural voice, falling back:", error);
            // Fallback to browser TTS
            setUseFallbackTTS(true);
            const fallbackScript = FULL_SCRIPT.replace(/\[PAUSA\]/g, ", , , ");
            const u = new SpeechSynthesisUtterance(fallbackScript);
            u.lang = 'es-ES';
            u.rate = 0.9;
            u.pitch = 0.8;
            utteranceRef.current = u;
            setIsLoadingVoice(false);
        }
    };

    generateVoice();

    // Auto-start visual & logic (audio waits for load)
    setIsActive(true);
    
    return () => {
        if (ctx.state !== 'closed') ctx.close();
        if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (phaseIndex < PHASES.length - 1) {
        setPhaseIndex(prev => prev + 1);
        setTimeLeft(PHASES[phaseIndex + 1].duration);
      } else {
        completeSession();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phaseIndex]);

  // Sync Audio with Play/Pause state
  useEffect(() => {
      if (isLoadingVoice) return;

      if (isActive && !isMuted) {
          // Resume Audio
          if (useFallbackTTS) {
              if (synthRef.current.paused) {
                  synthRef.current.resume();
              } else if (!synthRef.current.speaking && utteranceRef.current) {
                  synthRef.current.speak(utteranceRef.current);
              }
          } else if (audioContext) {
              audioContext.resume();
          }
          musicRef.current?.play().catch(() => {});
      } else {
          // Pause Audio
          if (useFallbackTTS) {
              synthRef.current.pause();
          } else if (audioContext) {
              audioContext.suspend();
          }
          musicRef.current?.pause();
      }
  }, [isActive, isMuted, isLoadingVoice, audioContext, useFallbackTTS]);


  const toggleMute = () => {
      setIsMuted(!isMuted);
  };

  const completeSession = () => {
    setIsActive(false);
    setIsCompleted(true);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    if (synthRef.current) synthRef.current.cancel();
    if (audioContext) audioContext.close();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentPhase = PHASES[phaseIndex];
  const progressPercent = ((phaseIndex * 60 + (60 - timeLeft)) / 180) * 100;

  if (isCompleted) {
    return (
      <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-black to-black" />
        
        {/* Partículas de Luz */}
        <div className="absolute inset-0 z-0">
           {Array.from({ length: 30 }).map((_, i) => (
               <div 
                key={i}
                className="absolute rounded-full bg-amber-100 animate-pulse"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    opacity: Math.random() * 0.5 + 0.2,
                    animationDelay: `${Math.random() * 4}s`
                }}
               />
           ))}
        </div>

        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 text-center space-y-8">
            <div className="size-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <span className="material-symbols-outlined text-4xl text-amber-200">check</span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight lowercase">rendición completada</h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    has soltado el control y regulado tu cortisol. estás en paz.
                </p>
            </div>
        </main>

        <footer className="p-8 relative z-20">
            <button 
                onClick={() => navigate('/dashboard')}
                className="w-full h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
                volver al dashboard
            </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden font-sans lowercase selection:bg-amber-500/20">
      
      {/* Musica Ambiental Etérea */}
      <audio ref={musicRef} loop src="https://cdn.pixabay.com/audio/2022/10/18/audio_31c261b32e.mp3" />

      {/* Header */}
      <header className="px-6 pt-12 flex justify-between items-center relative z-20">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em]">pausa de rendición</span>
             {isLoadingVoice && <span className="text-[8px] text-amber-500/60 font-bold animate-pulse mt-1">sincronizando voz...</span>}
        </div>
        <button onClick={toggleMute} className={`size-10 flex items-center justify-center transition-colors ${isMuted ? 'text-neutral-500' : 'text-amber-400'}`}>
            <span className="material-symbols-outlined">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
      </header>

      {/* Progress Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-10">
          <div className="h-full bg-gradient-to-r from-amber-600 to-purple-600 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        
        {/* Visualizador Central */}
        <div className="relative size-64 mb-12 flex items-center justify-center">
            
            {/* FASE 1: RESPIRACIÓN 4-7-8 */}
            {currentPhase.type === 'breathing' && (
                <>
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
                    <div className="size-48 bg-gradient-to-tr from-neutral-800 to-black rounded-full border border-amber-500/20 shadow-2xl flex items-center justify-center relative z-10 scale-animation">
                         <span className="material-symbols-outlined text-6xl text-amber-200/50">air</span>
                    </div>
                    <style>{`
                        @keyframes breathe-478 {
                            0% { transform: scale(1); opacity: 0.8; }
                            30% { transform: scale(1.25); opacity: 1; }
                            60% { transform: scale(1.25); opacity: 1; }
                            100% { transform: scale(1); opacity: 0.8; }
                        }
                        .scale-animation { animation: breathe-478 19s infinite ease-in-out; } 
                    `}</style>
                </>
            )}

            {/* FASE 2: GRATITUD */}
            {currentPhase.type === 'gratitude' && (
                <div className="size-56 rounded-full border border-amber-500/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-amber-900/20 rounded-full blur-xl animate-pulse" />
                    <span className="material-symbols-outlined text-6xl text-amber-200 opacity-90 animate-[spin_12s_linear_infinite]">wb_sunny</span>
                </div>
            )}

            {/* FASE 3: SURRENDER */}
            {currentPhase.type === 'surrender' && (
                <div className="size-56 rounded-full border border-purple-500/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-purple-900/20 rounded-full blur-xl" />
                    <span className="material-symbols-outlined text-6xl text-purple-200 opacity-80 animate-bounce">flight</span>
                </div>
            )}
        </div>

        {/* Guía Textual */}
        <div className="text-center space-y-6 max-w-sm animate-in slide-in-from-bottom-4 duration-700 key={phaseIndex}">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {currentPhase.guide}
            </h2>
            <p className="text-lg text-neutral-400 font-serif italic leading-relaxed">
                "{currentPhase.subtext}"
            </p>
        </div>

      </main>

      {/* Controls */}
      <footer className="px-8 pb-12 pt-6 flex flex-col items-center gap-6 relative z-20">
          <div className="text-4xl font-light text-white font-mono tracking-widest tabular-nums">
              {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsActive(!isActive)}
                disabled={isLoadingVoice}
                className={`size-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isLoadingVoice ? 'opacity-50' : ''}`}
              >
                  {isLoadingVoice ? (
                      <div className="size-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                      <span className="material-symbols-outlined text-2xl">{isActive ? 'pause' : 'play_arrow'}</span>
                  )}
              </button>
          </div>
          
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-2">
            fase {phaseIndex + 1} de 3 • ciencia + fe
          </p>
      </footer>

    </div>
  );
};

export default PrayerSession;
