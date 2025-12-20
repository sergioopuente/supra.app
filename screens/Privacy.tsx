
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { GoogleGenAI } from '@google/genai';

type Tone = 'directo' | 'empático' | 'motivador';
type Depth = 'breve' | 'normal' | 'profunda';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado del perfil incluyendo el nuevo campo Ikigai
  const [profile, setProfile] = useState({
    name: 'alex',
    isAnon: false,
    ikigai: 'construir una vida disciplinada, libre y con impacto real.', // Valor por defecto inspirador
    aiTone: 'directo' as Tone,
    aiDepth: 'normal' as Depth,
    spiritualMode: false,
    notifications: true,
    checkInTime: '20:00',
    dataSharing: false
  });

  const [selectedGoals, setSelectedGoals] = useState<string[]>(['ansiedad', 'foco']);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Estado para el modal de IA Ikigai
  const [showIkigaiModal, setShowIkigaiModal] = useState(false);
  const [ikigaiInput, setIkigaiInput] = useState('');
  const [isGeneratingIkigai, setIsGeneratingIkigai] = useState(false);

  // Simulación de auto-guardado
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
        setSaveStatus('saved');
    }, 600);
    const timer2 = setTimeout(() => {
        setSaveStatus('idle');
    }, 2000);
    return () => { clearTimeout(timer); clearTimeout(timer2); };
  }, [profile, selectedGoals]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleGenerateIkigai = async () => {
    if (!ikigaiInput.trim()) return;
    setIsGeneratingIkigai(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `El usuario quiere descubrir su Ikigai (propósito de vida) para una app estoica.
            El usuario dice: "${ikigaiInput}".
            
            Tus instrucciones:
            1. Analiza su respuesta.
            2. Destila la esencia en UNA sola frase poderosa, memorable y minimalista (máx 15 palabras).
            3. Tono: Serio, profundo, "Cyber-Stoic". Sin cursilerías.
            4. Formato: lowercase total.
            
            Ejemplo salida: "encontrar orden en el caos y liderar con el ejemplo."`,
        });

        if (response.text) {
            setProfile(prev => ({ ...prev, ikigai: response.text!.trim().toLowerCase() }));
            setShowIkigaiModal(false);
            setIkigaiInput('');
        }
    } catch (e) {
        console.error("Error generating Ikigai", e);
    } finally {
        setIsGeneratingIkigai(false);
    }
  };

  const goals = ['dormir mejor', 'ansiedad', 'más foco', 'disciplina', 'estoicismo'];

  return (
    <div className="flex-1 flex flex-col bg-black lowercase h-full overflow-hidden relative font-sans">
      
      {/* Header Fijo con Liquid Glass Heavy */}
      <header className="sticky top-0 z-40 liquid-glass-heavy flex items-center justify-between px-6 pt-12 pb-4 border-b-0">
        <div className="size-10" />
        <div className="flex flex-col items-center">
             <span className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-500 ${
                 saveStatus === 'saved' ? 'text-emerald-400' : 
                 saveStatus === 'saving' ? 'text-white' : 'text-neutral-400'
             }`}>
                {saveStatus === 'saving' ? 'guardando...' : saveStatus === 'saved' ? 'guardado' : 'ajustes & perfil'}
            </span>
        </div>
        <div className="size-10 flex items-center justify-end">
            {saveStatus === 'saving' && <div className="size-2 rounded-full bg-white animate-ping" />}
            {saveStatus === 'saved' && <span className="material-symbols-outlined text-emerald-400 text-sm animate-in fade-in">check</span>}
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 space-y-10 overflow-y-auto no-scrollbar pb-40">
        
        {/* BLOQUE 1: IDENTIDAD */}
        <section className="space-y-4">
            <div className="flex items-center gap-5 p-4 rounded-[2rem] liquid-glass">
                <div className="size-20 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 p-1 relative overflow-hidden">
                    {profile.isAnon ? (
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-neutral-600">visibility_off</span>
                        </div>
                    ) : (
                        <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all" />
                    )}
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">nombre visible</label>
                    <input 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={profile.isAnon}
                        className="bg-transparent text-2xl font-bold text-white outline-none w-full border-b border-transparent focus:border-white/20 transition-colors placeholder-neutral-600"
                    />
                </div>
            </div>
            
            <div className="px-2">
                <ToggleRow 
                    label="modo anónimo" 
                    sublabel="oculta tu identidad visual" 
                    active={profile.isAnon} 
                    onToggle={() => setProfile(p => ({...p, isAnon: !p.isAnon}))} 
                />
            </div>
        </section>

        <Divider />

        {/* BLOQUE NUEVO: IKIGAI (PROPÓSITO) - Liquid Glass */}
        <section className="space-y-4 relative group">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-300 text-lg">explore</span>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-purple-200 font-bold">mi ikigai</h3>
                </div>
                <button 
                    onClick={() => setShowIkigaiModal(true)}
                    className="text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    descubrir con ia
                </button>
            </div>

            <div className="relative rounded-[1.5rem] liquid-glass p-6 transition-all focus-within:bg-white/5 hover:bg-white/5">
                {/* Subtle Inner Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-[1.5rem] pointer-events-none" />
                
                <textarea 
                    value={profile.ikigai}
                    onChange={(e) => setProfile({...profile, ikigai: e.target.value})}
                    placeholder="¿qué te mueve cuando todo falla?"
                    maxLength={140}
                    className="w-full bg-transparent border-none text-white text-lg font-medium leading-relaxed outline-none resize-none placeholder-neutral-600 h-20 relative z-10"
                />
                <div className="absolute bottom-4 right-6 pointer-events-none z-10">
                     <span className="text-[10px] text-neutral-500 font-mono tracking-widest opacity-60">BRÚJULA INTERNA</span>
                </div>
            </div>
        </section>

        <Divider />

        {/* BLOQUE 2: PERSONALIDAD IA */}
        <section className="space-y-6">
            <SectionHeader title="personalidad del algoritmo" icon="psychology" />
            
            <div className="space-y-4">
                <div className="liquid-glass rounded-2xl p-1 flex">
                    {['directo', 'empático', 'motivador'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setProfile(p => ({...p, aiTone: t as Tone}))}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${profile.aiTone === t ? 'bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-md' : 'text-neutral-500 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-neutral-500">
                    {profile.aiTone === 'directo' && "sin rodeos. verdad cruda."}
                    {profile.aiTone === 'empático' && "escucha activa y validación."}
                    {profile.aiTone === 'motivador' && "empuje para la acción."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div className="liquid-glass rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">profundidad</span>
                    <div className="space-y-2">
                        {(['breve', 'normal', 'profunda'] as Depth[]).map(d => (
                            <button 
                                key={d}
                                onClick={() => setProfile(p => ({...p, aiDepth: d}))}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${profile.aiDepth === d ? 'bg-white/10 text-white' : 'text-neutral-600'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">enfoque</span>
                        <p className="text-sm font-bold text-white mt-1">espiritual</p>
                    </div>
                    <ToggleSwitch active={profile.spiritualMode} onToggle={() => setProfile(p => ({...p, spiritualMode: !p.spiritualMode}))} />
                 </div>
            </div>
        </section>

        <Divider />

        {/* BLOQUE 3: HÁBITOS */}
        <section className="space-y-6">
            <SectionHeader title="foco & objetivos" icon="target" />
            <div className="flex flex-wrap gap-2">
                {goals.map(g => (
                    <button
                        key={g}
                        onClick={() => toggleGoal(g)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${selectedGoals.includes(g) ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-500 border-white/10'}`}
                    >
                        {g}
                    </button>
                ))}
            </div>
            <ToggleRow 
                label="recordatorios suaves" 
                sublabel="20:00 - sin presión" 
                active={profile.notifications} 
                onToggle={() => setProfile(p => ({...p, notifications: !p.notifications}))} 
            />
        </section>

        <Divider />

        {/* BLOQUE 4: PRIVACIDAD */}
        <section className="space-y-4">
             <SectionHeader title="soberanía de datos" icon="shield_lock" />
             
             <div className="liquid-glass rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">datos compartidos</span>
                    <span className="text-emerald-400 font-bold uppercase text-xs tracking-widest">ninguno</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">encriptación</span>
                    <span className="text-white font-bold uppercase text-xs tracking-widest">grado militar</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="py-3 px-4 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-colors">
                    exportar todo
                </button>
                <button className="py-3 px-4 rounded-xl border border-red-900/30 text-xs font-bold text-red-400 hover:bg-red-900/10 transition-colors">
                    borrar historial
                </button>
             </div>
        </section>

        <Divider />

        {/* BLOQUE 6: PREMIUM */}
        <section className="relative overflow-hidden rounded-[2rem] p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-900" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            
            <div className="relative z-10 p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white italic font-serif">supra black</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">plan actual: gratuito</p>
                </div>
                <button className="px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
                    mejorar
                </button>
            </div>
        </section>

        {/* BLOQUE 7: LEGAL / FOOTER */}
        <footer className="pt-8 pb-4 flex flex-col items-center gap-4 opacity-40">
            <div className="flex gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                <button className="hover:text-white">soporte</button>
                <button className="hover:text-white">términos</button>
                <button className="hover:text-white">privacidad</button>
            </div>
            <span className="text-[9px] text-neutral-700">v1.0.4 (build 204)</span>
        </footer>

        {/* Espacio extra para el BottomNav */}
        <div className="h-10" />

      </main>

      {/* MODAL IA: DISCOVERY - Using Liquid Glass */}
      {showIkigaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300">
              <div className="w-full max-w-sm liquid-glass-heavy rounded-[2.5rem] p-8 relative overflow-hidden">
                  {/* Close Btn */}
                  <button onClick={() => setShowIkigaiModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white">
                      <span className="material-symbols-outlined">close</span>
                  </button>
                  
                  <div className="space-y-6">
                      <div className="size-16 rounded-full bg-gradient-to-tr from-purple-900 to-blue-900 flex items-center justify-center mb-2 mx-auto shadow-[0_0_30px_rgba(88,28,135,0.4)]">
                          <span className="material-symbols-outlined text-3xl text-white">auto_awesome</span>
                      </div>
                      
                      <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-white tracking-tight">la forja de propósito</h3>
                          <p className="text-neutral-400 text-sm leading-relaxed">
                              responde brevemente: ¿qué actividad te hace perder la noción del tiempo y sentirte útil?
                          </p>
                      </div>

                      <div className="relative">
                          <textarea 
                              value={ikigaiInput}
                              onChange={(e) => setIkigaiInput(e.target.value)}
                              placeholder="ej: resolver problemas complejos, crear música, ayudar a otros a entenderse..."
                              className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-neutral-600 border border-white/5 outline-none focus:border-purple-500/50 transition-colors resize-none text-sm"
                          />
                      </div>

                      <button 
                          onClick={handleGenerateIkigai}
                          disabled={isGeneratingIkigai || !ikigaiInput.trim()}
                          className="w-full h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isGeneratingIkigai ? (
                              <>
                                <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>forjando...</span>
                              </>
                          ) : (
                              <>
                                <span>descubrir</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <BottomNav />
    </div>
  );
};

/* --- Componentes UI Internos --- */

const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
    <div className="flex items-center gap-2 mb-2 px-2">
        <span className="material-symbols-outlined text-neutral-600 text-lg">{icon}</span>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold">{title}</h3>
    </div>
);

const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
);

const ToggleRow = ({ label, sublabel, active, onToggle }: { label: string, sublabel?: string, active: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-bold text-white">{label}</p>
            {sublabel && <p className="text-xs text-neutral-500 mt-0.5">{sublabel}</p>}
        </div>
        <ToggleSwitch active={active} onToggle={onToggle} />
    </div>
);

const ToggleSwitch = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-white' : 'bg-neutral-800 border border-white/10'}`}
    >
        <div className={`absolute top-0.5 size-5 rounded-full transition-all duration-300 shadow-sm ${active ? 'left-5 bg-black' : 'left-0.5 bg-neutral-500'}`} />
    </button>
);

export default Privacy;
