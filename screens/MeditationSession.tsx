
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
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
// -------------------------------------------

const FULL_SCRIPT = `
Hola. Vamos a regalarnos tres minutos para resetear tu sistema nervioso. Sé que hay mucho ruido afuera, pero aquí adentro, tú tienes el control. 
[PAUSA]
Empecemos hackeando tu nervio vago para apagar la señal de alerta. Inhala profundo por la nariz... siente cómo se infla tu abdomen... y exhala muy lento por la boca, como si empañaras un espejo. Al hacer esto, le dices químicamente a tu cerebro que estás a salvo. Sigue respirando.
[PAUSA]
Ahora, lleva tu atención a tu cuerpo. Escanea tensiones innecesarias. Nota si estás apretando la mandíbula o el entrecejo. Suéltalos. Deja caer tus hombros lejos de las orejas. Desbloquea las manos. No necesitas estar a la defensiva en este momento. Siente la gravedad actuando a tu favor. Relaja.
[PAUSA]
Para terminar, ancla esta sensación. Recuerda: no eres tus pensamientos ansiosos, eres la consciencia que los observa. Tienes la capacidad biológica y mental de manejar lo que viene. Inhala confianza... exhala dudas. Cuando estés listo, abre los ojos. Estás reseteado.
`;

const PHASES = [
  {
    id: 1,
    title: "reset del sistema",
    guide: "hackeando el nervio vago",
    subtext: "inhala en 4... exhala en 8... dile a tu cerebro que estás a salvo.",
    duration: 60,
    type: 'breathing'
  },
  {
    id: 2,
    title: "escaneo somático",
    guide: "relajación progresiva",
    subtext: "suelta la mandíbula. baja los hombros. apaga la defensa.",
    duration: 60,
    type: 'body_scan'
  },
  {
    id: 3,
    title: "reencuadre cognitivo",
    guide: "metacognición activa",
    subtext: "no eres tus pensamientos. eres quien los observa.",
    duration: 60,
    type: 'mindfulness'
  }
];

const MeditationSession: React.FC = () => {
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
  
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // 1. Initialize Audio Context
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(ctx);

    // 2. Generate Neural Audio (Kore Voice)
    const generateVoice = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Soft pauses using ellipsis
            const cleanScript = FULL_SCRIPT.replace(/\[PAUSA\]/g, " ... ");

            // INCREASED TIMEOUT to 45 seconds to prioritize high quality AI voice
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout: Audio generation took too long")), 45000)
            );

            const apiPromise = ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: cleanScript }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is suited for meditation
                        },
                    },
                },
            });

            // Race the API call against the timeout
            const response: any = await Promise.race([apiPromise, timeoutPromise]);
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                const rawBytes = base64ToUint8Array(base64Audio);
                const buffer = await pcmToAudioBuffer(rawBytes, ctx);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
                
                await ctx.suspend(); // Start paused
                setIsLoadingVoice(false);
            } else {
                throw new Error("No audio data");
            }
        } catch (error) {
            console.warn("Using fallback TTS due to error or timeout:", error);
            // Fallback to browser TTS (Robotic) - Only if API fails or times out
            setUseFallbackTTS(true);
            const fallbackScript = FULL_SCRIPT.replace(/\[PAUSA\]/g, ", , , ");
            const u = new SpeechSynthesisUtterance(fallbackScript);
            u.lang = 'es-ES';
            u.rate = 0.9;
            utteranceRef.current = u;
            setIsLoadingVoice(false);
        }
    };

    generateVoice();
    
    // Auto-start visual (voice waits for loading)
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

  // Sync Audio Context with Play/Pause
  useEffect(() => {
      if (isLoadingVoice) return;

      if (isActive && !isMuted) {
          if (useFallbackTTS) {
               if (synthRef.current.paused) {
                  synthRef.current.resume();
               } else if (!synthRef.current.speaking && utteranceRef.current) {
                  synthRef.current.speak(utteranceRef.current);
               }
          } else if (audioContext) {
              audioContext.resume();
          }
      } else {
          if (useFallbackTTS) {
              synthRef.current.pause();
          } else if (audioContext) {
              audioContext.suspend();
          }
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
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/40 via-black to-black" />
        
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 text-center space-y-8">
            <div className="size-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <span className="material-symbols-outlined text-4xl text-cyan-200">check</span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight lowercase">mente reseteada</h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    has reducido tu cortisol y activado tu sistema parasimpático.
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
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden font-sans lowercase selection:bg-cyan-500/20">
      
      {/* BACKGROUND ANIMADO CONTINUO */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-black to-blue-900/40 animate-gradient-x z-0 opacity-80" />

      {/* Header */}
      <header className="px-6 pt-12 flex justify-between items-center relative z-20">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">reset mental • 3 min</span>
             {isLoadingVoice && <span className="text-[8px] text-cyan-500/60 font-bold animate-pulse mt-1">sincronizando voz humana...</span>}
        </div>
        <button onClick={toggleMute} className={`size-10 flex items-center justify-center transition-colors ${isMuted ? 'text-neutral-500' : 'text-cyan-400'}`}>
            <span className="material-symbols-outlined">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
      </header>

      {/* Progress Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-10">
          <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        
        {/* Visualizador Central */}
        <div className="relative size-64 mb-12 flex items-center justify-center">
            {/* Círculos concéntricos animados */}
            <div className={`absolute inset-0 border border-cyan-500/10 rounded-full transition-transform duration-[4000ms] ${isActive ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
            <div className={`absolute inset-0 border border-cyan-500/20 rounded-full transition-transform duration-[4000ms] delay-1000 ${isActive ? 'scale-125 opacity-0' : 'scale-75 opacity-100'}`} />
            
            <div className="size-56 rounded-full bg-gradient-to-b from-cyan-900/20 to-black border border-cyan-500/30 flex items-center justify-center relative shadow-[0_0_40px_rgba(34,211,238,0.1)]">
                <span className={`material-symbols-outlined text-6xl text-cyan-200/80 transition-all duration-[4000ms] ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {currentPhase.type === 'breathing' ? 'air' : currentPhase.type === 'body_scan' ? 'accessibility_new' : 'psychology'}
                </span>
            </div>
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
            fase {phaseIndex + 1} de 3 • base científica
          </p>
      </footer>

    </div>
  );
};

export default MeditationSession;
