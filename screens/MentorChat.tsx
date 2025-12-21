
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality } from '@google/genai';
// BottomNav removed to clean up interface

interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean; // To visualize which messages used deep thinking
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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'hola alex. soy tu mentor supra. ¿en qué batalla mental estás hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Chat Intelligence Mode
  const [isDeepThinking, setIsDeepThinking] = useState(false);

  // Live API State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Cleanup Live Session on unmount
  useEffect(() => {
      return () => {
          if (audioContext) audioContext.close();
      };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // MODEL SELECTION LOGIC
      // Fast: gemini-3-flash-preview (Low latency)
      // Deep: gemini-3-pro-preview (High reasoning)
      const modelName = isDeepThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const requestConfig: any = {
        // Updated instruction to enforce structure and line breaks
        systemInstruction: 'Eres el Mentor de SUPRA, una app de bienestar para la Generación Z. Tu tono es estoico moderno: pragmático, empoderador, directo y sin adornos innecesarios. No eres un psicólogo clínico, eres un guía de hábitos atómicos y fortaleza mental. Responde siempre en minúsculas. REGLA DE ORO: Estructura visualmente tus respuestas. Si das consejos o pasos, usa listas numeradas y OBLIGATORIAMENTE pon cada punto en una línea nueva separada para aportar orden y claridad mental (ej: 1. acción\n2. acción).',
      };

      if (isDeepThinking) {
          requestConfig.thinkingConfig = { thinkingBudget: 32768 };
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: requestConfig
      });

      const responseText = result.text || 'la mente a veces se queda en silencio. respira.';
      setMessages(prev => [...prev, { role: 'model', text: responseText.toLowerCase(), isThinking: isDeepThinking }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'error en la conexión. mantén la calma.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceMode = async () => {
      if (mode === 'text') {
          setMode('voice');
          await startLiveSession();
      } else {
          setMode('text');
          setIsLiveConnected(false);
          // Close context/session logic would go here
          if (audioContext) audioContext.close();
      }
  };

  const startLiveSession = async () => {
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Check for microphone permission explicitly or handle the getUserMedia error specificially
          let stream;
          try {
             stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (e) {
              console.error("Microphone access error:", e);
              setMode('text');
              alert("No se encontró micrófono o se denegó el permiso. Revisa la configuración del navegador.");
              return;
          }

          // Output Context (24kHz is standard for Gemini Flash Audio output)
          const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          setAudioContext(newAudioContext);
          
          // Reset the audio queue cursor
          nextStartTimeRef.current = 0;
          
          // Input Context (16kHz is standard for Gemini Audio input)
          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = createBlob(inputData);
              // Ensure we only send data once the session is established
              if (sessionRef.current) {
                  sessionRef.current.then(session => session.sendRealtimeInput({ media: blob }));
              }
          };
          
          source.connect(processor);
          processor.connect(inputCtx.destination);

          // CONNECT TO LIVE API
          sessionRef.current = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: { 
                      voiceConfig: { 
                          prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
                      } 
                  },
                  systemInstruction: 'Eres el Mentor de SUPRA. Habla con tono calmado, profundo, estoico y empático. Sé breve y ve al grano.'
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
                          
                          // QUEUE LOGIC:
                          // Schedule the next chunk to start either NOW or at the end of the previous chunk, whichever is later.
                          const time = Math.max(newAudioContext.currentTime, nextStartTimeRef.current);
                          src.start(time);
                          
                          // Advance the cursor
                          nextStartTimeRef.current = time + buffer.duration;
                      }
                  },
                  onclose: () => setIsLiveConnected(false),
                  onerror: (e) => console.error(e)
              }
          });

      } catch (err) {
          console.error("Live API Error", err);
          setMode('text'); // Fallback
          alert("Error conectando con el servicio de voz.");
      }
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full lowercase overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 border-b border-white/5 apple-blur sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {/* Minimalist Back Button (No Stem) */}
            <button 
                onClick={() => navigate(-1)} 
                className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors mr-1 -ml-2"
            >
                <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
            </button>

            <div className={`size-10 rounded-full p-[1px] transition-all duration-500 ${mode === 'voice' ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 animate-pulse' : 'bg-gradient-to-tr from-purple-600 to-emerald-400'}`}>
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px] icon-filled">{mode === 'voice' ? 'graphic_eq' : 'auto_awesome'}</span>
                </div>
            </div>
            <div>
                <h2 className="text-base font-bold text-white tracking-tight">mentor supra</h2>
                <div className="flex items-center gap-1.5">
                    <div className={`size-1.5 rounded-full ${isLiveConnected ? 'bg-cyan-400' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                        {mode === 'voice' ? (isLiveConnected ? 'live voice' : 'conectando...') : 'ia activa'}
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
              
              {/* Visualizer Circle */}
              <div className="relative size-64 flex items-center justify-center">
                   <div className="absolute inset-0 border border-cyan-500/30 rounded-full scale-100 animate-[ping_3s_ease-in-out_infinite]" />
                   <div className="absolute inset-0 border border-blue-500/20 rounded-full scale-125 animate-[ping_4s_ease-in-out_infinite_1s]" />
                   <div className="size-48 bg-black rounded-full border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex items-center justify-center relative z-10">
                       <span className="material-symbols-outlined text-6xl text-cyan-200 opacity-80">graphic_eq</span>
                   </div>
              </div>
              <p className="mt-12 text-xs font-bold text-cyan-200/50 uppercase tracking-[0.3em] animate-pulse">escuchando...</p>
          </div>
      ) : (
          <>
            {/* Message List */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar"
            >
                {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {/* ADDED whitespace-pre-wrap to enable line breaks */}
                    <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-base leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai text-white/90'
                    } ${m.isThinking ? 'border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : ''}`}>
                    {m.text}
                    {m.isThinking && <div className="mt-2 flex items-center gap-1 opacity-50"><span className="material-symbols-outlined text-[10px]">psychology</span><span className="text-[9px] uppercase tracking-widest">razonamiento profundo</span></div>}
                    </div>
                </div>
                ))}
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

            {/* Input Section */}
            <footer className="p-6 pb-8 space-y-3">
                
                {/* Thinking Mode Toggle Pill */}
                <div className="flex justify-center">
                    <button 
                        onClick={() => setIsDeepThinking(!isDeepThinking)}
                        className={`px-3 py-1 rounded-full flex items-center gap-2 border transition-all duration-300 ${
                            isDeepThinking 
                            ? 'bg-purple-900/30 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-white/20'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-xs ${isDeepThinking ? 'animate-pulse' : ''}`}>
                            {isDeepThinking ? 'psychology' : 'bolt'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isDeepThinking ? 'modo pensador' : 'modo rápido'}
                        </span>
                    </button>
                </div>

                <div className="bg-neutral-900 rounded-[2rem] border border-white/5 p-2 flex items-center gap-2 focus-within:border-white/20 transition-all">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="habla conmigo..."
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none focus:ring-0 text-base"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`size-12 rounded-full flex items-center justify-center transition-all ${
                        input.trim() ? 'bg-white text-black scale-100' : 'bg-neutral-800 text-neutral-600 scale-90'
                    }`}
                >
                    <span className="material-symbols-outlined">north</span>
                </button>
                </div>
            </footer>
          </>
      )}
      
      {/* BottomNav removed */}
    </div>
  );
};

export default MentorChat;
