
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

const Suggestion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{ title: string; strategy: string; focus: string } | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
        const stored = localStorage.getItem('supra_onboarding_temp');
        if (!stored) {
            navigate('/needs');
            return;
        }
        
        const data = JSON.parse(stored);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Artificial delay for "Thinking" UX (Users trust complex processes more if they take a moment)
            await new Promise(r => setTimeout(r, 2000));

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analiza este perfil de usuario nuevo:
                Nombre: ${data.name}
                Estado de ánimo (0-100): ${data.mood}
                Objetivo principal: ${data.goal}
                
                Genera un "Protocolo de Inicio" en JSON:
                {
                    "title": "Título épico y corto para su plan (ej: Protocolo Espartano)",
                    "strategy": "Una frase poderosa explicando por qué este plan funcionará para su objetivo.",
                    "focus": "Una sola palabra clave en mayúsculas (ej: DISCIPLINA)"
                }
                Solo JSON.`,
                config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
                const result = JSON.parse(response.text);
                setAnalysis(result);
                
                // Save essential data to persistent profile
                const existingProfile = localStorage.getItem('supra_profile');
                let profile = existingProfile ? JSON.parse(existingProfile) : {};
                
                profile = {
                    ...profile,
                    name: data.name,
                    goals: [data.goal], // Set initial goal
                    xp: 0, // Init gamification
                    isPremium: false
                };
                localStorage.setItem('supra_profile', JSON.stringify(profile));
            }
        } catch (e) {
            console.error(e);
            // Fallback
            setAnalysis({
                title: 'protocolo base',
                strategy: 'el primer paso para el orden mental es la observación.',
                focus: 'CLARIDAD'
            });
        } finally {
            setLoading(false);
        }
    };

    generateAnalysis();
  }, []);

  if (loading) {
      return (
          <div className="flex-1 flex flex-col bg-black items-center justify-center p-8 text-center space-y-8">
              <div className="relative size-32">
                  <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin" />
                  <div className="absolute inset-2 rounded-full border-r-2 border-white/50 animate-spin [animation-duration:1.5s]" />
                  <div className="absolute inset-4 rounded-full border-b-2 border-white/20 animate-spin [animation-duration:2s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-white animate-pulse">spa</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight animate-pulse">conectando con tu intención...</h2>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest">preparando tu espacio</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden animate-in fade-in duration-1000">
      
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-full h-2/3 bg-gradient-to-b from-neutral-900 to-black z-0 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-20%] size-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <main className="flex-1 flex flex-col relative z-10 px-8 pt-16 pb-10 justify-between">
        
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4 animate-in slide-in-from-top-4 duration-700">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">camino trazado</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tighter leading-none animate-in slide-in-from-left-4 duration-700 delay-100">
                    tu enfoque: <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 italic font-serif">
                        {analysis?.title.toLowerCase()}
                    </span>
                </h1>
            </div>

            {/* The Card */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-700 delay-200">
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">filosofía central</span>
                    <p className="text-lg font-medium text-white leading-relaxed">
                        "{analysis?.strategy}"
                    </p>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">palabra clave</span>
                        <p className="text-2xl font-bold text-white tracking-widest">{analysis?.focus}</p>
                    </div>
                    <div className="size-12 rounded-full bg-white text-black flex items-center justify-center">
                        <span className="material-symbols-outlined">key</span>
                    </div>
                </div>
            </div>

            {/* Features Teaser (Monetization Seed) */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-700 delay-300">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                    <span className="material-symbols-outlined text-neutral-400 mb-2">graphic_eq</span>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">guía constante</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="material-symbols-outlined text-xs text-white bg-black/50 px-2 py-1 rounded">lock</span>
                    </div>
                    <span className="material-symbols-outlined text-neutral-400 mb-2">center_focus_strong</span>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">percepción visual</p>
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-500">
            <button 
                onClick={() => navigate('/dashboard')}
                className="w-full h-16 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 transition-all group"
            >
                <span>comenzar ahora</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                día 1
            </p>
        </div>

      </main>
    </div>
  );
};

export default Suggestion;
