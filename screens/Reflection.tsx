
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import BottomNav from '../components/BottomNav';
import { QuotaManager } from '../utils/QuotaManager';
import { SyncManager } from '../utils/SyncManager';

interface AiAnalysis {
  mood: string;
  insight: string;
}

const Reflection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [entryText, setEntryText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysis | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Firestore History State
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Lux Tone Filter
  const [isLux, setIsLux] = useState(false);
  
  // ENTRY FRICTION STATE
  const [showCentering, setShowCentering] = useState(true);

  // Media States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);

  useEffect(() => {
    // Check Profile Tone Preference
    const saved = localStorage.getItem('supra_profile');
    if (saved) {
        const p = JSON.parse(saved);
        setIsLux(p.spiritualMode === true);
    }
    
    // CENTERING TIMER (Friction)
    const timer = setTimeout(() => {
        setShowCentering(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // LOAD HISTORY WHEN TAB CHANGES
  useEffect(() => {
      if (activeTab === 'history') {
          setIsLoadingHistory(true);
          SyncManager.getJournalHistory().then(data => {
              // Transform Firestore timestamp if needed or just use raw data
              // Mapping to UI format
              const formatted = data.map(d => ({
                  id: d.id,
                  date: new Date(d.timestamp).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
                  preview: d.text,
                  tag: d.mood
              }));
              setHistory(formatted);
              setIsLoadingHistory(false);
          });
      }
  }, [activeTab]);

  // --- AUDIO TRANSCRIPTION LOGIC ---
  const handleToggleRecord = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
        // CHECK ENERGY (AUDIO TRANSCRIPTION)
        if (!QuotaManager.canAfford('neural_tts')) { // Using neural_tts bucket for transcription cost approximation
            alert(QuotaManager.getDepletedMessage());
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone", err);
            alert("No se pudo acceder al micrófono.");
        }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
      setIsProcessingMedia(true);
      try {
          // CONSUME ENERGY
          QuotaManager.consume('neural_tts');

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
                          { text: "Transcribe el siguiente audio exactamente como se escucha. Solo devuelve el texto." }
                      ]
                  }
              });

              if (response.text) {
                  setEntryText(prev => prev + (prev ? ' ' : '') + response.text);
              }
              setIsProcessingMedia(false);
          };
      } catch (e) {
          console.error("Transcription error", e);
          setIsProcessingMedia(false);
      }
  };

  // --- IMAGE ANALYSIS LOGIC ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      // CHECK ENERGY (VISION)
      if (!QuotaManager.canAfford('vision')) {
          const isPremium = QuotaManager.isPremium();
          if (!isPremium) {
            if (confirm("Energía insuficiente para Visión. ¿Desbloquear Supra Black?")) {
                navigate('/premium');
            }
          } else {
              alert(QuotaManager.getDepletedMessage());
          }
          return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      setIsProcessingMedia(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
          const base64Image = (reader.result as string).split(',')[1];
          const mimeType = file.type;

          try {
              // CONSUME ENERGY
              QuotaManager.consume('vision');

              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: mimeType, data: base64Image } },
                          { text: isLux 
                             ? "Analiza esta imagen buscando belleza, gratitud o propósito. Genera una reflexión espiritual breve (máx 15 palabras) en minúsculas."
                             : "Analiza esta imagen desde una perspectiva estoica y psicológica. Describe ambiente y genera reflexión breve (máx 15 palabras) en minúsculas." 
                          }
                      ]
                  }
              });

              if (response.text) {
                  setEntryText(prev => prev + (prev ? '\n\n' : '') + `[mirada ${isLux ? 'lux' : 'estoica'}]: ${response.text}`);
              }
          } catch (e) {
              console.error("Image analysis error", e);
          } finally {
              setIsProcessingMedia(false);
          }
      };
  };

  // --- TEXT ANALYSIS LOGIC (EXPLICIT TRIGGER) ---
  const handleAnalyze = async () => {
    if (!entryText.trim()) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = isLux
        ? `Analiza este texto de diario personal: "${entryText}".
           Actúa como un guía espiritual compasivo. Busca señales de gratitud, propósito o carga emocional.
           Responde ÚNICAMENTE un objeto JSON:
           {
             "mood": "emoción dominante (ej: esperanza, carga, paz)",
             "insight": "breve reflexión sobre providencia o soltar el control (máx 12 palabras, minúsculas)"
           }`
        : `Analiza este texto de diario personal: "${entryText}".
           Actúa como un espejo estoico y analítico. Busca lógica y control.
           Responde ÚNICAMENTE un objeto JSON:
           {
             "mood": "emoción dominante (ej: caos, orden, estoico)",
             "insight": "breve reflexión sobre disciplina o aceptación (máx 12 palabras, minúsculas)"
           }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const text = response.text;
      if (text) {
          try {
            const json = JSON.parse(text);
            setAiResult(json);
          } catch (e) {
             setAiResult({ mood: 'reflexivo', insight: 'el orden exterior comienza con el orden interior.' });
          }
      }
    } catch (e) {
      console.error(e);
      setAiResult({ mood: 'sereno', insight: 'la calma es una elección interna.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
      setSaveStatus('saving');
      
      // Si no hay análisis, guardamos como neutral/sin insight
      const newEntry = {
          // Remove ID, Firestore will handle it or we set it later
          timestamp: Date.now(),
          date: new Date().toISOString(),
          text: entryText,
          mood: aiResult?.mood || 'neutral',
          tags: aiResult ? [aiResult.mood] : [],
          insight: aiResult?.insight || null
      };

      // Sync to Backend (Firestore)
      await SyncManager.saveJournalEntry(newEntry);

      setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => {
              setEntryText('');
              setAiResult(null);
              setSaveStatus('idle');
              setActiveTab('history');
          }, 800);
      }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase selection:bg-white selection:text-black">
      
      {/* CENTERING FRICTION OVERLAY */}
      {showCentering && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-3xl flex items-center justify-center animate-out fade-out duration-1000 delay-1000 fill-mode-forwards pointer-events-none">
              <div className="text-center space-y-4">
                  <div className="size-16 rounded-full border border-white/20 flex items-center justify-center mx-auto animate-pulse">
                      <div className="size-8 rounded-full bg-white/10" />
                  </div>
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-[0.3em] animate-in slide-in-from-bottom-4 duration-1000">
                      aterriza en el presente
                  </p>
              </div>
          </div>
      )}

      {/* MAIN SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        
        {/* HEADER SECTION (Title + Controls) */}
        <div className="px-4 pt-4 pb-2 flex flex-col gap-5">
            {/* Top Bar with Action Button */}
            <div className="flex justify-between items-center h-6">
                <div className="size-6" />
                {activeTab === 'write' && entryText.length > 0 && (
                    <button 
                        onClick={handleSave} 
                        disabled={saveStatus !== 'idle'}
                        className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors disabled:opacity-50"
                    >
                        {saveStatus === 'saving' ? 'guardando...' : saveStatus === 'saved' ? 'guardado' : 'finalizar'}
                        {saveStatus === 'saved' && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                )}
            </div>

            {/* Apple Large Title - MOVED ABOVE SEGMENTED CONTROL */}
            <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">privado & encriptado</p>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tighter">diario</h1>
                    {isLux && <span className="px-2 py-0.5 rounded-full bg-amber-900/30 border border-amber-500/30 text-[9px] font-bold text-amber-200 uppercase tracking-widest">filtro lux</span>}
                </div>
            </div>

            {/* Segmented Control */}
            <div className="bg-neutral-900/80 p-1 rounded-xl flex relative border border-white/5">
                <div 
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${activeTab === 'history' ? 'left-[50%]' : 'left-1'}`} 
                />
                <button 
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest z-10 transition-colors text-center ${activeTab === 'write' ? 'text-white' : 'text-neutral-500'}`}
                >
                    escribir
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest z-10 transition-colors text-center ${activeTab === 'history' ? 'text-white' : 'text-neutral-500'}`}
                >
                    historial
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-4 pt-4">
            
            {activeTab === 'write' ? (
                <div className="flex flex-col animate-in fade-in duration-500 min-h-[60vh]">
                    
                    {/* AI INSIGHT CARD (Condicional y explícito) */}
                    {aiResult && (
                        <div className={`mb-6 liquid-glass rounded-[1.5rem] p-5 flex items-start gap-4 animate-in slide-in-from-top-4 border-l-2 shadow-2xl ${isLux ? 'border-l-amber-400/50' : 'border-l-purple-400/50'}`}>
                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isLux ? 'bg-amber-500/10' : 'bg-purple-500/10'}`}>
                                <span className={`material-symbols-outlined text-lg ${isLux ? 'text-amber-300' : 'text-purple-300'}`}>auto_awesome</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">perspectiva</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-white uppercase border border-white/5">{aiResult.mood}</span>
                                </div>
                                <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                                    "{aiResult.insight}"
                                </p>
                            </div>
                            <button onClick={() => setAiResult(null)} className="text-neutral-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    {/* TEXT AREA: Distraction Free */}
                    <div className="relative flex-1">
                        <textarea 
                            value={entryText}
                            onChange={(e) => setEntryText(e.target.value)}
                            placeholder={isProcessingMedia ? "escuchando..." : isLux ? "suelta tus cargas aquí..." : "vacia tu mente aquí..."}
                            className="w-full h-[50vh] bg-transparent text-lg text-white placeholder-neutral-700 outline-none resize-none leading-relaxed font-normal selection:bg-white/20 pb-20"
                            spellCheck={false}
                            autoFocus
                        />
                        
                        {/* Media Tools (Bottom Left) */}
                        <div className="absolute bottom-4 left-0 flex gap-2">
                            <button 
                                onClick={handleToggleRecord}
                                className={`size-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'bg-neutral-800/80 text-neutral-400 border border-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{isRecording ? 'stop' : 'mic'}</span>
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="size-10 rounded-full bg-neutral-800/80 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-all relative overflow-hidden"
                            >
                                {!QuotaManager.isPremium() && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"><span className="material-symbols-outlined text-[10px] text-amber-400">lock</span></div>}
                                <span className="material-symbols-outlined text-xl">image</span>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            </button>
                        </div>

                        {/* Floating Analyze Button (Bottom Right - EXPLICIT) */}
                        {/* Solo aparece si hay texto y no se está analizando ya */}
                        {entryText.length > 20 && !aiResult && !isAnalyzing && (
                            <button 
                                onClick={handleAnalyze}
                                className="absolute bottom-4 right-0 px-5 py-3 bg-neutral-900 border border-white/10 rounded-full flex items-center gap-3 shadow-xl active:scale-95 transition-all group hover:border-white/30 backdrop-blur-md"
                            >
                                <div className={`size-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors`}>
                                    <span className={`material-symbols-outlined text-xs group-hover:rotate-12 transition-transform ${isLux ? 'text-amber-300' : 'text-purple-300'}`}>auto_awesome</span>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">explorar con ia</span>
                            </button>
                        )}

                        {(isAnalyzing || isProcessingMedia) && (
                            <div className="absolute bottom-4 right-0 flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5 backdrop-blur-sm">
                                <div className={`size-3 border-2 border-white/20 rounded-full animate-spin ${isLux ? 'border-t-amber-400' : 'border-t-purple-400'}`} />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{isAnalyzing ? 'leyendo...' : 'observando...'}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* HISTORY LIST VIEW */
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pt-2 min-h-[50vh]">
                    
                    {isLoadingHistory ? (
                        <div className="text-center py-20">
                            <div className="size-6 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"/>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">recuperando memoria...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="pt-20 text-center pb-8 opacity-40">
                            <span className="material-symbols-outlined text-2xl text-neutral-700 mb-2">history_edu</span>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-widest">tu historia comienza hoy</p>
                        </div>
                    ) : (
                        <>
                        {/* Timeline Connector Line */}
                        <div className="absolute left-[19px] top-40 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />

                        {history.map((entry) => (
                            <div key={entry.id} className="group relative pl-10 py-2 cursor-pointer">
                                {/* Timeline Dot */}
                                <div className="absolute left-[4px] top-3.5 size-2.5 rounded-full bg-black border-2 border-neutral-700 group-hover:border-white group-hover:scale-110 transition-all z-10" />
                                
                                <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-5 hover:bg-neutral-900/60 hover:border-white/10 transition-all active:scale-[0.99]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{entry.date}</span>
                                        {entry.tag && (
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                entry.tag === 'ansiedad' ? 'text-orange-300 border-orange-900/30 bg-orange-900/10' :
                                                entry.tag === 'foco' ? 'text-emerald-300 border-emerald-900/30 bg-emerald-900/10' :
                                                'text-neutral-400 border-neutral-800 bg-neutral-800/50'
                                            }`}>
                                                {entry.tag}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-neutral-300 text-sm font-medium line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {entry.preview}
                                    </p>
                                </div>
                            </div>
                        ))}
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Reflection;
