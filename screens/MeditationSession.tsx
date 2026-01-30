
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleGenAI, Modality } from '@google/genai';
import { QuotaManager } from '../utils/QuotaManager';
import { Analytics, EVENTS } from '../utils/Analytics';
import { getLanguage, t } from '../utils/Translations';
import { OfflineManager } from '../utils/OfflineManager';

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

async function blobToAudioBuffer(blob: Blob, ctx: AudioContext): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    // For raw PCM we need manual decoding if it's not a standard container.
    // However, since we store the PCM data, we can reuse pcmToAudioBuffer logic
    // But for simplicity in OfflineManager, we stored raw bytes.
    // Let's reuse pcmToAudioBuffer logic assuming blob contains raw pcm data.
    const uint8 = new Uint8Array(arrayBuffer);
    return pcmToAudioBuffer(uint8, ctx);
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

// SCRIPTS MULTILINGUES
const FULL_SCRIPTS = {
    es: `Hola. Vamos a regalarnos tres minutos para resetear tu sistema nervioso. Sé que hay mucho ruido afuera, pero aquí adentro, tú tienes el control. [PAUSA] Empecemos hackeando tu nervio vago para apagar la señal de alerta. Inhala profundo por la nariz... siente cómo se infla tu abdomen... y exhala muy lento por la boca, como si empañaras un espejo. Al hacer esto, le dices químicamente a tu cerebro que estás a salvo. Sigue respirando. [PAUSA] Ahora, lleva tu atención a tu cuerpo. Escanea tensiones innecesarias. Nota si estás apretando la mandíbula o el entrecejo. Suéltalos. Deja caer tus hombros lejos de las orejas. Desbloquea las manos. No necesitas estar a la defensiva en este momento. Siente la gravedad actuando a tu favor. Relaja. [PAUSA] Para terminar, ancla esta sensación. Recuerda: no eres tus pensamientos ansiosos, eres la consciencia que los observa. Tienes la capacidad biológica y mental de manejar lo que viene. Inhala confianza... exhala dudas. Cuando estés listo, abre los ojos. Estás reseteado.`,
    en: `Hello. Let's give ourselves three minutes to reset your nervous system. I know there is noise outside, but in here, you are in control. [PAUSE] Let's start by hacking your vagus nerve to turn off the alert signal. Inhale deeply through your nose... feel your abdomen expand... and exhale very slowly through your mouth, as if fogging up a mirror. By doing this, you chemically tell your brain that you are safe. Keep breathing. [PAUSE] Now, bring your attention to your body. Scan for unnecessary tension. Notice if you are clenching your jaw or furrowing your brow. Release them. Let your shoulders drop away from your ears. Unclench your hands. You don't need to be defensive right now. Feel gravity working in your favor. Relax. [PAUSE] To finish, anchor this sensation. Remember: you are not your anxious thoughts, you are the consciousness observing them. You have the biological and mental capacity to handle what comes next. Inhale confidence... exhale doubt. When you are ready, open your eyes. You are reset.`,
    pt: `Olá. Vamos nos dar três minutos para resetar seu sistema nervoso. Sei que há muito barulho lá fora, mas aqui dentro, você está no controle. [PAUSA] Vamos começar hackeando seu nervo vago para desligar o sinal de alerta. Inspire profundamente pelo nariz... sinta seu abdômen inflar... e expire muito lentamente pela boca, como se estivesse embaçando um espelho. Ao fazer isso, você diz quimicamente ao seu cérebro que está seguro. Continue respirando. [PAUSA] Agora, traga sua atenção para o seu corpo. Escaneie tensões desnecessárias. Note se você está apertando a mandíbula ou a testa. Solte-os. Deixe seus ombros caírem longe das orelhas. Desbloqueie as mãos. Você não precisa estar na defensiva neste momento. Sinta a gravidade agindo a seu favor. Relaxe. [PAUSA] Para terminar, ancore essa sensação. Lembre-se: você não é seus pensamentos ansiosos, você é a consciência que os observa. Você tem a capacidade biológica e mental de lidar com o que vem a seguir. Inspire confiança... expire dúvidas. Quando estiver pronto, abra os olhos. Você está resetado.`
};

const PHASES = [
  { id: 1, duration: 60, type: 'breathing' },
  { id: 2, duration: 60, type: 'body_scan' },
  { id: 3, duration: 60, type: 'mindfulness' }
];

const MeditationSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSOS = searchParams.get('mode') === 'sos';

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isSOS ? 180 : PHASES[0].duration); // SOS = 3 mins continuous
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const currentLang = getLanguage();
  
  // Audio State
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isLoadingVoice, setIsLoadingVoice] = useState(true);
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    Analytics.track(EVENTS.FEATURE_USED, { feature: 'meditation', type: isSOS ? 'sos_panic' : 'reset_3_min' });

    // 1. Initialize Audio Context
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(ctx);

    // 2. SOS MODE: BYPASS AI GENERATION
    if (isSOS) {
        setIsLoadingVoice(false);
        setIsActive(true);
        // SOS doesn't need GenAI voice, it needs immediacy.
        // We rely on the breathing visual and perhaps background music.
        return;
    }

    // 3. Normal Mode: Generate Neural Audio (Kore Voice) with Smart Caching
    const generateVoice = async () => {
        const cacheKey = `meditation_reset_${currentLang}_v1`;
        
        // A. Try Cache First
        const cachedBlob = await OfflineManager.getAudio(cacheKey);
        if (cachedBlob) {
            console.log("Using cached audio");
            setIsOfflineMode(true);
            try {
                const buffer = await blobToAudioBuffer(cachedBlob, ctx);
                setupAudioSource(ctx, buffer);
                return;
            } catch (e) {
                console.error("Error decoding cached audio", e);
                // Fallthrough to API
            }
        }

        // B. API Call if no cache
        // CHECK QUOTA
        if (!QuotaManager.canAfford('neural_tts')) {
            console.log("Quota exceeded. Using browser TTS.");
            setUseFallbackTTS(true);
            setupFallbackTTS();
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const rawScript = FULL_SCRIPTS[currentLang as 'es'|'en'|'pt'] || FULL_SCRIPTS['es'];
            const cleanScript = rawScript.replace(/\[(PAUSA|PAUSE)\]/g, " ... ");

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout: Audio generation took too long")), 45000)
            );

            // CONSUME QUOTA
            QuotaManager.consume('neural_tts');

            const apiPromise = ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: cleanScript }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                        },
                    },
                },
            });

            const response: any = await Promise.race([apiPromise, timeoutPromise]);
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                const rawBytes = base64ToUint8Array(base64Audio);
                const buffer = await pcmToAudioBuffer(rawBytes, ctx);
                
                // Cache for next time
                const blobToCache = new Blob([rawBytes], { type: 'audio/pcm' });
                OfflineManager.saveAudio(cacheKey, blobToCache);

                setupAudioSource(ctx, buffer);
            } else {
                throw new Error("No audio data");
            }
        } catch (error) {
            console.warn("Using fallback TTS due to error or timeout:", error);
            setUseFallbackTTS(true);
            setupFallbackTTS();
        }
    };

    const setupAudioSource = async (ctx: AudioContext, buffer: AudioBuffer) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        await ctx.suspend(); 
        setIsLoadingVoice(false);
    };

    const setupFallbackTTS = () => {
        const rawScript = FULL_SCRIPTS[currentLang as 'es'|'en'|'pt'] || FULL_SCRIPTS['es'];
        const fallbackScript = rawScript.replace(/\[(PAUSA|PAUSE)\]/g, ", , , ");
        const u = new SpeechSynthesisUtterance(fallbackScript);
        
        // Map app language to TTS lang code
        const ttsLang = currentLang === 'es' ? 'es-ES' : currentLang === 'pt' ? 'pt-BR' : 'en-US';
        u.lang = ttsLang;
        u.rate = 0.9;
        utteranceRef.current = u;
        setIsLoadingVoice(false);
    };

    generateVoice();
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
        
        // Haptic Feedback for 4-7-8 Breathing in SOS Mode
        if (isSOS && navigator.vibrate) {
            const cycleTime = 19; // 4+7+8
            const currentSec = 180 - timeLeft;
            const cyclePos = currentSec % cycleTime;
            
            // Inhale (0-4s) - Light ticks
            if (cyclePos < 4 && cyclePos % 1 === 0) navigator.vibrate(10);
            // Hold (4-11s) - Nothing
            // Exhale (11-19s) - Stronger release
            if (cyclePos > 11 && cyclePos % 2 === 0) navigator.vibrate(20);
        }

      }, 1000);
    } else if (timeLeft === 0) {
      if (!isSOS && phaseIndex < PHASES.length - 1) {
        setPhaseIndex(prev => prev + 1);
        setTimeLeft(PHASES[phaseIndex + 1].duration);
      } else {
        completeSession();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phaseIndex, isSOS]);

  // Sync Audio Context with Play/Pause
  useEffect(() => {
      if (isLoadingVoice && !isSOS) return;

      if (isActive && !isMuted) {
          if (!isSOS) {
              if (useFallbackTTS) {
                   if (synthRef.current.paused) {
                      synthRef.current.resume();
                   } else if (!synthRef.current.speaking && utteranceRef.current) {
                      synthRef.current.speak(utteranceRef.current);
                   }
              } else if (audioContext) {
                  audioContext.resume();
              }
          }
      } else {
          if (!isSOS) {
              if (useFallbackTTS) {
                  synthRef.current.pause();
              } else if (audioContext) {
                  audioContext.suspend();
              }
          }
      }
  }, [isActive, isMuted, isLoadingVoice, audioContext, useFallbackTTS, isSOS]);

  const toggleMute = () => {
      setIsMuted(!isMuted);
  };

  const completeSession = () => {
    setIsActive(false);
    setIsCompleted(true);
    Analytics.track(EVENTS.SESSION_COMPLETE, { type: 'meditation', duration: 180 });
    
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    if (synthRef.current) synthRef.current.cancel();
    if (audioContext) audioContext.close();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get current phase details from translations
  const phaseData = t(`meditation.phases.${phaseIndex + 1}`) as any;
  const currentPhase = isSOS 
    ? { title: "SOS Mode", guide: "4-7-8 Breathing", subtext: "Inhale (4s), Hold (7s), Exhale (8s)", type: 'breathing' } 
    : { ...PHASES[phaseIndex], ...phaseData };
  
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
                <h1 className="text-3xl font-bold text-white tracking-tight lowercase">{t('meditation.complete_title')}</h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    {t('meditation.complete_desc')}
                </p>
            </div>
        </main>

        <footer className="p-8 relative z-20">
            <button 
                onClick={() => navigate('/dashboard')}
                className="w-full h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                aria-label={t('meditation.back_home')}
            >
                {t('meditation.back_home')}
            </button>
        </footer>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden font-sans lowercase selection:bg-cyan-500/20 ${isSOS ? 'bg-amber-950' : 'bg-black'}`}>
      
      {/* BACKGROUND ANIMADO CONTINUO */}
      <div className={`absolute inset-0 bg-gradient-to-br animate-gradient-x z-0 opacity-80 ${isSOS ? 'from-amber-900 via-red-900 to-black' : 'from-cyan-900/40 via-black to-blue-900/40'}`} />

      {/* Header */}
      <header className="px-6 pt-12 flex justify-between items-center relative z-20">
        <button 
            onClick={() => navigate(-1)} 
            className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
            aria-label={t('common.close')}
        >
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
             <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isSOS ? 'text-amber-500 animate-pulse' : 'text-cyan-500'}`}>
                 {isSOS ? 'emergencia emocional' : t('meditation.title')}
             </span>
             <div className="flex gap-2 justify-center">
                 {!isSOS && isLoadingVoice && <span className="text-[8px] text-cyan-500/60 font-bold animate-pulse mt-1">{t('meditation.sync_voice')}</span>}
                 {isSOS && <span className="text-[8px] text-amber-200/60 font-bold mt-1">respiración 4-7-8</span>}
             </div>
        </div>
        <button 
            onClick={toggleMute} 
            className={`size-10 flex items-center justify-center transition-colors ${isMuted ? 'text-neutral-500' : isSOS ? 'text-amber-400' : 'text-cyan-400'}`}
            aria-label="Toggle mute"
        >
            <span className="material-symbols-outlined">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
      </header>

      {/* Progress Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-10">
          <div className={`h-full transition-all duration-1000 ease-linear ${isSOS ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`} style={{ width: `${isSOS ? ((180 - timeLeft) / 180) * 100 : progressPercent}%` }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        
        {/* Visualizador Central */}
        <div className="relative size-64 mb-12 flex items-center justify-center">
            {/* Círculos concéntricos animados */}
            <div className={`absolute inset-0 border rounded-full transition-transform duration-[4000ms] ${isSOS ? 'border-amber-500/10' : 'border-cyan-500/10'} ${isActive ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
            <div className={`absolute inset-0 border rounded-full transition-transform duration-[4000ms] delay-1000 ${isSOS ? 'border-amber-500/20' : 'border-cyan-500/20'} ${isActive ? 'scale-125 opacity-0' : 'scale-75 opacity-100'}`} />
            
            <div className={`size-56 rounded-full bg-gradient-to-b to-black border flex items-center justify-center relative shadow-[0_0_40px_rgba(34,211,238,0.1)] ${isSOS ? 'from-amber-900/20 border-amber-500/30' : 'from-cyan-900/20 border-cyan-500/30'}`}>
                {isSOS ? (
                    <div className="text-center">
                        <span className="text-6xl font-bold text-amber-100 font-mono">
                            {timeLeft % 19 < 4 ? '4' : timeLeft % 19 < 11 ? '7' : '8'}
                        </span>
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-2">
                            {timeLeft % 19 < 4 ? 'inhala' : timeLeft % 19 < 11 ? 'sostén' : 'exhala'}
                        </p>
                    </div>
                ) : (
                    <span className={`material-symbols-outlined text-6xl text-cyan-200/80 transition-all duration-[4000ms] ${isActive ? 'scale-110' : 'scale-100'}`}>
                        {currentPhase.type === 'breathing' ? 'air' : currentPhase.type === 'body_scan' ? 'accessibility_new' : 'psychology'}
                    </span>
                )}
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
                disabled={isLoadingVoice && !isSOS}
                className={`size-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isLoadingVoice && !isSOS ? 'opacity-50' : ''}`}
                aria-label={isActive ? "Pause meditation" : "Start meditation"}
              >
                 {isLoadingVoice && !isSOS ? (
                      <div className="size-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                      <span className="material-symbols-outlined text-2xl">{isActive ? 'pause' : 'play_arrow'}</span>
                  )}
              </button>
          </div>
          
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-2">
            {isSOS ? 'modo pánico • rescate inmediato' : `fase ${phaseIndex + 1} de 3 • base científica`}
          </p>
      </footer>

    </div>
  );
};

export default MeditationSession;
