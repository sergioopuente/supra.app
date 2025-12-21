
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import BottomNav from '../components/BottomNav';

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

  // Media States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);

  // Datos simulados para el historial
  const history = [
    { id: 1, date: 'ayer', preview: 'la presión del proyecto final me tiene bloqueado, necesito priorizar...', tag: 'ansiedad' },
    { id: 2, date: 'lun 12', preview: 'logré mantener la calma durante la presentación, respirar funcionó.', tag: 'foco' },
    { id: 3, date: 'dom 11', preview: 'nada especial, solo descanso y lectura.', tag: 'calma' },
  ];

  // --- AUDIO TRANSCRIPTION LOGIC ---
  const handleToggleRecord = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
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
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Use webm for browser compatibility
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
          // Convert Blob to Base64
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
      const file = event.target.files?.[0];
      if (!file) return;

      setIsProcessingMedia(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
          const base64Image = (reader.result as string).split(',')[1];
          const mimeType = file.type;

          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: mimeType, data: base64Image } },
                          { text: "Analiza esta imagen desde una perspectiva estoica y psicológica. Describe brevemente el ambiente emocional que transmite y genera una reflexión profunda de una frase (máximo 15 palabras) en minúsculas." }
                      ]
                  }
              });

              if (response.text) {
                  setEntryText(prev => prev + (prev ? '\n\n' : '') + `[análisis visual]: ${response.text}`);
              }
          } catch (e) {
              console.error("Image analysis error", e);
          } finally {
              setIsProcessingMedia(false);
          }
      };
  };

  // --- TEXT ANALYSIS LOGIC ---
  const handleAnalyze = async () => {
    if (!entryText.trim()) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza este texto de diario personal: "${entryText}".
        Actúa como un espejo estoico y analítico.
        Responde ÚNICAMENTE un objeto JSON válido con este formato exacto:
        {
          "mood": "una sola palabra en minúsculas que defina la emoción dominante",
          "insight": "una frase muy breve (máximo 12 palabras) que aporte claridad o perspectiva estoica, en minúsculas"
        }
        No uses markdown, solo el JSON raw.`,
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
      setSaveStatus('saving');
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
      
      {/* HEADER: TABS & PRIVACY & ACTIONS */}
      <header className="px-6 pt-12 pb-4 flex flex-col gap-6 sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-neutral-500">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">privado & encriptado</span>
             </div>
             
             {/* Action Button: Contextual */}
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

        {/* Apple-style Segmented Control */}
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
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-40 px-6 pt-6 relative">
        
        {activeTab === 'write' ? (
            <div className="h-full flex flex-col animate-in fade-in duration-500">
                
                {/* AI INSIGHT CARD (Condicional: Liquid Glass) */}
                {aiResult && (
                    <div className="mb-6 liquid-glass rounded-[1.5rem] p-5 flex items-start gap-4 animate-in slide-in-from-top-4 border-l-2 border-l-purple-400/50">
                        <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-1">
                            <span className="material-symbols-outlined text-purple-300 text-lg">auto_awesome</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">espejo ia</span>
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
                <div className="relative flex-1 min-h-[50vh]">
                    <textarea 
                        value={entryText}
                        onChange={(e) => setEntryText(e.target.value)}
                        placeholder={isProcessingMedia ? "procesando..." : "vacia tu mente aquí..."}
                        className="w-full h-full bg-transparent text-lg text-white placeholder-neutral-700 outline-none resize-none leading-relaxed font-normal selection:bg-white/20 pb-20"
                        spellCheck={false}
                        autoFocus
                    />
                    
                    {/* Media Tools */}
                    <div className="absolute bottom-4 left-0 flex gap-2">
                         <button 
                            onClick={handleToggleRecord}
                            className={`size-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'bg-neutral-800/80 text-neutral-400 border border-white/5 hover:text-white'}`}
                         >
                             <span className="material-symbols-outlined text-xl">{isRecording ? 'stop' : 'mic'}</span>
                         </button>
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="size-10 rounded-full bg-neutral-800/80 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                         >
                             <span className="material-symbols-outlined text-xl">image</span>
                             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                         </button>
                    </div>

                    {/* Floating Analyze Button (Only appears when meaningful text exists) */}
                    {entryText.length > 20 && !aiResult && !isAnalyzing && (
                        <button 
                            onClick={handleAnalyze}
                            className="absolute bottom-4 right-0 px-4 py-2.5 bg-neutral-800/80 hover:bg-neutral-700 border border-white/10 backdrop-blur-md rounded-full flex items-center gap-2 transition-all animate-in fade-in zoom-in shadow-xl group"
                        >
                            <span className="material-symbols-outlined text-purple-300 text-sm group-hover:rotate-12 transition-transform">auto_awesome</span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">analizar</span>
                        </button>
                    )}

                    {(isAnalyzing || isProcessingMedia) && (
                         <div className="absolute bottom-4 right-0 flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5 backdrop-blur-sm">
                             <div className="size-3 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
                             <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{isAnalyzing ? 'leyendo...' : 'procesando media...'}</span>
                         </div>
                    )}
                </div>
            </div>
        ) : (
            /* HISTORY LIST VIEW */
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pt-2">
                
                {/* Timeline Connector Line */}
                <div className="absolute left-[35px] top-6 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />

                {history.map((entry) => (
                    <div key={entry.id} className="group relative pl-12 py-2 cursor-pointer">
                        {/* Timeline Dot */}
                        <div className="absolute left-[20px] top-3.5 size-2.5 rounded-full bg-black border-2 border-neutral-700 group-hover:border-white group-hover:scale-110 transition-all z-10" />
                        
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
                
                <div className="pt-12 text-center pb-8 opacity-40">
                    <span className="material-symbols-outlined text-2xl text-neutral-700 mb-2">history_edu</span>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest">comienzo del registro</p>
                </div>
            </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
};

export default Reflection;
