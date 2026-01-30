
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality } from '@google/genai';
import { QuotaManager, STOIC_FALLBACKS } from '../utils/QuotaManager';

interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

// Helpers for Live API Audio
const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
};

const decodeAudio = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const MentorChat: React.FC = () => {
  const navigate = useNavigate();
  // LÍMITES EXPLÍCITOS EN EL PRIMER MENSAJE
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // FRICTION STATE
  const [isHolding, setIsHolding] = useState(false);

  // Perfil State for Lux Filter
  const [isLux, setIsLux] = useState(false);

  // Live API State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<Promise<any> | null>(null);
  
  // Timer for Quota Management (Not used for Live time anymore, just session start cost)
  
  // Initialize: Check Profile Tone
  useEffect(() => {
    const saved = localStorage.getItem('supra_profile');
    let luxMode = false;
    if (saved) {
        const p = JSON.parse(saved);
        luxMode = p.spiritualMode === true;
    }
    setIsLux(luxMode);

    // Initial Message based on Tone
    if (luxMode) {
        setMessages([{ role: 'model', text: 'hola. soy tu mentor lux.\n\nno soy terapeuta, sino una guía para encontrar sentido y gratitud.\n\n¿qué carga quieres entregar hoy?' }]);
    } else {
        setMessages([{ role: 'model', text: 'hola. soy tu mentor supra.\n\nno soy médico ni terapeuta, solo un espejo estoico para tus pensamientos.\n\n¿qué te quita la paz hoy?' }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Cleanup Live Session on unmount
  useEffect(() => {
      return () => {
          stopLiveSession();
      };
  }, []);

  const handleSendTrigger = () => {
      if (!input.trim() || isTyping || isHolding) return;
      
      // 1. CONSCIOUS FRICTION: Pause before sending
      setIsHolding(true);
      
      // 1.5s delay to force "presence" over "impulse"
      setTimeout(() => {
          setIsHolding(false);
          executeSend();
      }, 1500);
  };

  const executeSend = async () => {
    // CHECK ENERGY (TEXT)
    if (!QuotaManager.canAfford('text_chat')) {
        setMessages(prev => [...prev, { role: 'model', text: QuotaManager.getDepletedMessage().toLowerCase() }]);
        return;
    }

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Consume Quota
      QuotaManager.consume('text_chat');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // --- FILTRO TONAL LUX VS ESTOICO ---
      let instructions = '';
      if (isLux) {
          // LUX: Spiritual, Compassionate, Meaning-focused
          instructions = `Eres el Mentor LUX de SUPRA. Tu rol es ser un guía espiritual (filtro: gratitud, propósito, rendición).
          Reglas:
          1. Tono cálido pero calmado.
          2. Enfócate en la gratitud, la providencia y el sentido trascendente (sin ser religioso específico, pero sí espiritual).
          3. Respuestas breves (máx 3 oraciones).
          4. Usa minúsculas siempre (estilo minimalista).
          5. Si hay riesgo grave, deriva a ayuda profesional.
          `;
      } else {
          // DEFAULT: Stoic, Objective, Discipline-focused
          instructions = `Eres el Mentor SUPRA. Tu rol NO es ser un amigo complaciente. Eres una voz estoica, calmada y objetiva.
          Reglas:
          1. Mantén la calma absoluta.
          2. Enfócate en la lógica, la dicotomía del control y la disciplina.
          3. Respuestas breves (máx 3 oraciones).
          4. Usa minúsculas siempre.
          5. Si hay riesgo grave, deriva a ayuda profesional.
          `;
      }

      const requestConfig: any = {
        systemInstruction: instructions
      };

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: requestConfig
      });

      const responseText = result.text || 'la mente a veces se queda en silencio. respira.';
      setMessages(prev => [...prev, { role: 'model', text: responseText.toLowerCase() }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'error en la conexión. mantén la calma.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceMode = async () => {
      if (mode === 'text') {
          // CHECK ENERGY (LIVE SESSION)
          if (!QuotaManager.canAfford('live_session')) {
              const isPremium = QuotaManager.isPremium();
              if (!isPremium) {
                if(confirm("Energía insuficiente para Live. ¿Desbloquear Supra Black para energía infinita?")) {
                    navigate('/premium');
                }
              } else {
                 alert("Batería mental agotada hoy.");
              }
              return;
          }
          
          setMode('voice');
          await startLiveSession();
      } else {
          setMode('text');
          stopLiveSession();
      }
  };

  const stopLiveSession = () => {
      setIsLiveConnected(false);
      if (audioContext) audioContext.close();
      sessionRef.current = null;
  };

  const startLiveSession = async () => {
      try {
          // Consume Energy UPFRONT for the session
          QuotaManager.consume('live_session');

          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          let stream;
          try {
             stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (e) {
              console.error("Microphone access error:", e);
              setMode('text');
              alert("No se encontró micrófono.");
              return;
          }

          const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          setAudioContext(newAudioContext);
          nextStartTimeRef.current = 0;
          
          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = createBlob(inputData);
              if (sessionRef.current) {
                  sessionRef.current.then(session => session.sendRealtimeInput({ media: blob }));
              }
          };
          
          source.connect(processor);
          processor.connect(inputCtx.destination);
          
          // Voice Definition based on Lux Mode
          // Zephyr (Calm/Neutral) for Stoic
          // Puck (Softer/Warm) for Lux
          const voiceName = isLux ? 'Puck' : 'Zephyr';
          const instruction = isLux 
            ? 'Eres Mentor Lux. Tono: Cálido, espiritual, enfocado en propósito y rendición. Breve.'
            : 'Eres Mentor Supra. Tono: Estoico, lógico, enfocado en disciplina. Breve.';

          sessionRef.current = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: { 
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } 
                  },
                  systemInstruction: instruction
              },
              callbacks: {
                  onopen: () => {
                      setIsLiveConnected(true);
                      console.log("Live Session Connected");
                  },
                  onmessage: async (msg) => {
                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData) {
                          const buffer = await newAudioContext.decodeAudioData(decodeAudio(audioData).buffer);
                          const src = newAudioContext.createBufferSource();
                          src.buffer = buffer;
                          src.connect(newAudioContext.destination);
                          const time = Math.max(newAudioContext.currentTime, nextStartTimeRef.current);
                          src.start(time);
                          nextStartTimeRef.current = time + buffer.duration;
                      }
                  },
                  onclose: () => {
                      setIsLiveConnected(false);
                  },
                  onerror: (e) => console.error(e)
              }
          });

      } catch (err) {
          console.error("Live API Error", err);
          setMode('text');
          alert("Error conectando con el servicio de voz.");
      }
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full lowercase overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 border-b border-white/5 apple-blur sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate(-1)} 
                className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors mr-1 -ml-2"
            >
                <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
            </button>

            <div className={`size-10 rounded-full p-[1px] transition-all duration-500 ${mode === 'voice' ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 animate-pulse' : isLux ? 'bg-gradient-to-tr from-amber-500 to-orange-400' : 'bg-gradient-to-tr from-purple-600 to-emerald-400'}`}>
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px] icon-filled">{mode === 'voice' ? 'graphic_eq' : 'auto_awesome'}</span>
                </div>
            </div>
            <div>
                <h2 className="text-base font-bold text-white tracking-tight">mentor {isLux ? 'lux' : 'supra'}</h2>
                <div className="flex items-center gap-1.5">
                    <div className={`size-1.5 rounded-full ${isLiveConnected ? 'bg-cyan-400' : isLux ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                        {mode === 'voice' ? (isLiveConnected ? `en vivo` : 'conectando...') : `en línea`}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={toggleVoiceMode} className={`size-10 rounded-full flex items-center justify-center transition-all ${mode === 'voice' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                <span className="material-symbols-outlined">{mode === 'voice' ? 'keyboard' : 'mic'}</span>
            </button>
            <button onClick={() => setMessages([{ role: 'model', text: 'historia borrada. mente nueva.' }])} className="text-neutral-500 hover:text-white transition-colors size-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
            </button>
        </div>
      </header>

      {/* Mode Content */}
      {mode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-blue-900/20 pointer-events-none" />
              
              <div className="relative size-64 flex items-center justify-center">
                   <div className="absolute inset-0 border border-cyan-500/30 rounded-full scale-100 animate-[ping_3s_ease-in-out_infinite]" />
                   <div className="absolute inset-0 border border-blue-500/20 rounded-full scale-125 animate-[ping_4s_ease-in-out_infinite_1s]" />
                   <div className="size-48 bg-black rounded-full border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex items-center justify-center relative z-10">
                       <span className="material-symbols-outlined text-6xl text-cyan-200 opacity-80">graphic_eq</span>
                   </div>
              </div>
              <p className="mt-12 text-xs font-bold text-cyan-200/50 uppercase tracking-[0.3em] animate-pulse">escuchando...</p>
              <p className="mt-4 text-[10px] text-neutral-500">mantén la calma</p>
          </div>
      ) : (
          <>
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar"
            >
                {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-base leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai text-white/90'
                    }`}>
                    {m.text}
                    </div>
                </div>
                ))}
                {/* Visual feedback for 'Breathing' friction state */}
                {isHolding && (
                    <div className="flex justify-end">
                         <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest animate-pulse pr-2">
                             respira...
                         </div>
                    </div>
                )}
                {isTyping && (
                <div className="flex justify-start">
                    <div className="chat-bubble-ai rounded-[1.5rem] px-5 py-3.5 flex gap-1 items-center">
                    <div className="size-1.5 bg-neutral-500 rounded-full typing-dot" />
                    <div className="size-1.5 bg-neutral-500 rounded-full typing-dot [animation-delay:0.2s]" />
                    <div className="size-1.5 bg-neutral-500 rounded-full typing-dot [animation-delay:0.4s]" />
                    </div>
                </div>
                )}
            </div>

            <footer className="p-6 pb-8 space-y-3">
                <div className="bg-neutral-900 rounded-[2rem] border border-white/5 p-2 flex items-center gap-2 focus-within:border-white/20 transition-all">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTrigger()}
                    placeholder="habla conmigo..."
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none focus:ring-0 text-base"
                />
                <button 
                    onClick={handleSendTrigger}
                    disabled={!input.trim() || isTyping || isHolding}
                    className={`size-12 rounded-full flex items-center justify-center transition-all ${
                        input.trim() ? 'bg-white text-black scale-100' : 'bg-neutral-800 text-neutral-600 scale-90'
                    }`}
                >
                    {isHolding ? (
                        <span className="material-symbols-outlined animate-spin text-sm">cached</span>
                    ) : (
                        <span className="material-symbols-outlined">north</span>
                    )}
                </button>
                </div>
            </footer>
          </>
      )}
    </div>
  );
};

export default MentorChat;
