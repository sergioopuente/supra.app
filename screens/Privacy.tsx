
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { GoogleGenAI } from '@google/genai';

type Tone = 'directo' | 'empático' | 'motivador';
type Depth = 'breve' | 'normal' | 'profunda';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Estado del perfil con inicialización Lazy desde localStorage
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('supra_profile');
    let data;
    if (saved) {
        data = JSON.parse(saved);
    } else {
        data = {
            name: 'alex',
            ikigai: 'construir una vida disciplinada, libre y con impacto real.',
            aiTone: 'directo' as Tone,
            aiDepth: 'normal' as Depth,
            isAnon: false,
            spiritualMode: false,
            notifications: true,
            haptics: true,
            cloudSync: false
        };
    }
    // Asegurar que darkMode exista y sea true por defecto
    if (data.darkMode === undefined) data.darkMode = true;
    return data;
  });

  const [selectedGoals, setSelectedGoals] = useState<string[]>(['ansiedad', 'foco']);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Estado para el modal de IA Ikigai
  const [showIkigaiModal, setShowIkigaiModal] = useState(false);
  const [ikigaiInput, setIkigaiInput] = useState('');
  const [isGeneratingIkigai, setIsGeneratingIkigai] = useState(false);

  // Auto-guardado en LocalStorage
  useEffect(() => {
    setSaveStatus('saving');
    
    // Persistencia real
    localStorage.setItem('supra_profile', JSON.stringify(profile));

    const timer = setTimeout(() => {
        setSaveStatus('saved');
    }, 600);
    const timer2 = setTimeout(() => {
        setSaveStatus('idle');
    }, 2000);
    return () => { clearTimeout(timer); clearTimeout(timer2); };
  }, [profile, selectedGoals]);

  // Manejo instantáneo del tema
  const handleThemeToggle = () => {
      const newDarkMode = !profile.darkMode;
      setProfile((prev: any) => ({ ...prev, darkMode: newDarkMode }));
      
      if (newDarkMode) {
          document.documentElement.classList.remove('light-mode');
      } else {
          document.documentElement.classList.add('light-mode');
      }
  };

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
            4. Formato: todo en minúsculas, sin excepción.`,
        });

        if (response.text) {
            setProfile((prev: any) => ({ ...prev, ikigai: response.text!.trim().toLowerCase() }));
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
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans">
      
      {/* Scrollable Main Container covering full screen */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        
        {/* Top Status Bar (Scrolls with page) */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
            <div className="size-10" />
            <div className="size-10 flex items-center justify-end">
                {saveStatus === 'saving' && <div className="size-2 rounded-full bg-white animate-ping" />}
                {saveStatus === 'saved' && <span className="material-symbols-outlined text-emerald-400 text-sm animate-in fade-in">check</span>}
            </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-8">
            
            {/* Apple Large Title Header */}
            <div>
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-500 mb-1 block ${
                    saveStatus === 'saved' ? 'text-emerald-400' : 
                    saveStatus === 'saving' ? 'text-white' : 'text-neutral-500'
                }`}>
                    {saveStatus === 'saving' ? 'guardando...' : saveStatus === 'saved' ? 'guardado' : 'sistema'}
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tighter">perfil</h1>
            </div>
            
            {/* BLOQUE 1: MANIFIESTO DE IDENTIDAD */}
            <section className="space-y-4">
                {/* Tarjeta de Usuario */}
                <div className="flex items-center gap-5 p-4 rounded-[2rem] liquid-glass relative overflow-hidden group">
                    
                    {/* Imagen con Overlay de Edición */}
                    <div className="relative cursor-pointer hover:scale-105 transition-transform duration-300">
                        <div className="size-20 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 p-1 relative overflow-hidden shrink-0 shadow-lg">
                            {profile.isAnon ? (
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/10">
                                    <span className="material-symbols-outlined text-4xl text-neutral-600">visibility_off</span>
                                </div>
                            ) : (
                                <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover rounded-full grayscale" />
                            )}
                        </div>
                        {/* Botón flotante para editar imagen */}
                        {!profile.isAnon && (
                            <button className="absolute bottom-0 right-0 size-7 bg-white text-black rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:scale-90 transition-transform border border-black z-10">
                                <span className="material-symbols-outlined text-[14px] font-bold">edit</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-1 relative">
                        <div className="flex items-center justify-between pr-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">nombre visible</label>
                            <button 
                                onClick={() => nameInputRef.current?.focus()}
                                className="text-neutral-600 hover:text-white transition-colors active:scale-90"
                            >
                                <span className="material-symbols-outlined text-base">edit_square</span>
                            </button>
                        </div>
                        
                        <input 
                            ref={nameInputRef}
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value.toLowerCase()})}
                            disabled={profile.isAnon}
                            className="bg-transparent text-3xl font-bold text-white outline-none w-full border-b border-transparent focus:border-white/20 transition-colors placeholder-neutral-600 tracking-tight lowercase"
                        />
                    </div>
                </div>

                {/* IKIGAI (PROPÓSITO) */}
                <div className="relative rounded-[2rem] liquid-glass p-6 transition-all focus-within:bg-white/5 hover:bg-white/5 border border-purple-500/10">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400 text-sm drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">explore</span>
                            <h3 className="text-[10px] uppercase tracking-[0.25em] text-purple-200 font-bold">mi ikigai</h3>
                        </div>
                        <button 
                            onClick={() => setShowIkigaiModal(true)}
                            className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            ia
                        </button>
                    </div>
                    <textarea 
                        value={profile.ikigai}
                        onChange={(e) => setProfile({...profile, ikigai: e.target.value})}
                        placeholder="¿qué te mueve cuando todo falla?"
                        maxLength={140}
                        className="w-full bg-transparent border-none text-white text-lg font-serif italic leading-relaxed outline-none resize-none placeholder-neutral-600 h-24 relative z-10 selection:bg-purple-500/30 lowercase"
                    />
                </div>
            </section>

            {/* BLOQUE 2: CALIBRACIÓN Y OBJETIVOS (Formato Horizontal Unificado) */}
            <section className="space-y-6">
                
                {/* Tono del Mentor */}
                <div className="space-y-2">
                    <SectionHeader title="tono del mentor" icon="psychology" />
                    <div className="liquid-glass rounded-2xl p-1 flex">
                        {['directo', 'empático', 'motivador'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setProfile((p:any) => ({...p, aiTone: t as Tone}))}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all lowercase ${profile.aiTone === t ? 'bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-md' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Profundidad de Respuesta */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-neutral-600 text-lg">format_align_left</span>
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold">profundidad</h3>
                    </div>
                    <div className="liquid-glass rounded-2xl p-1 flex">
                        {(['breve', 'normal', 'profunda'] as Depth[]).map(d => (
                            <button 
                                key={d}
                                onClick={() => setProfile((p:any) => ({...p, aiDepth: d}))}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all lowercase ${profile.aiDepth === d ? 'bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-md' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Foco & Objetivos */}
                <div className="space-y-2">
                    <SectionHeader title="foco & objetivos" icon="target" />
                    <div className="liquid-glass rounded-2xl p-1 flex overflow-x-auto no-scrollbar">
                        {goals.map(g => (
                            <button
                                key={g}
                                onClick={() => toggleGoal(g)}
                                className={`flex-1 min-w-[80px] py-3 rounded-xl text-xs font-bold transition-all lowercase whitespace-nowrap px-3 ${selectedGoals.includes(g) ? 'bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-md' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <Divider />

            {/* BLOQUE 4: SISTEMA OPERATIVO PERSONAL (TOGGLES UNIFICADOS) */}
            <section className="space-y-4">
                <SectionHeader title="sistema & preferencias" icon="settings_suggest" />
                
                <div className="liquid-glass rounded-3xl overflow-hidden border border-white/5">
                    
                    {/* OPCIÓN MODO OSCURO */}
                    <ToggleRow 
                        icon={profile.darkMode ? "dark_mode" : "light_mode"}
                        label="modo oscuro" 
                        sublabel={profile.darkMode ? "interfaz de inmersión total" : "modo claridad activo"} 
                        active={profile.darkMode} 
                        onToggle={handleThemeToggle} 
                    />

                    <div className="h-px bg-white/5 mx-4" />

                    <ToggleRow 
                        icon="visibility_off"
                        label="modo anónimo" 
                        sublabel="oculta tu identidad visual en la app" 
                        active={profile.isAnon} 
                        onToggle={() => setProfile((p:any) => ({...p, isAnon: !p.isAnon}))} 
                    />
                    
                    <div className="h-px bg-white/5 mx-4" />

                    <ToggleRow 
                        icon="wb_incandescent"
                        label="modo lux" 
                        sublabel="apartarte del ruido para escuchar a Dios" 
                        active={profile.spiritualMode} 
                        onToggle={() => setProfile((p:any) => ({...p, spiritualMode: !p.spiritualMode}))} 
                    />

                    <div className="h-px bg-white/5 mx-4" />

                    <ToggleRow 
                        icon="notifications"
                        label="recordatorios" 
                        sublabel="check-in diario a las 20:00" 
                        active={profile.notifications} 
                        onToggle={() => setProfile((p:any) => ({...p, notifications: !p.notifications}))} 
                    />

                    <div className="h-px bg-white/5 mx-4" />
                    
                    <ToggleRow 
                        icon="vibration"
                        label="respuesta háptica" 
                        sublabel="vibración al interactuar" 
                        active={profile.haptics} 
                        onToggle={() => setProfile((p:any) => ({...p, haptics: !p.haptics}))} 
                    />

                    <div className="h-px bg-white/5 mx-4" />

                    <ToggleRow 
                        icon="cloud_sync"
                        label="supra cloud" 
                        sublabel="sincronización encriptada" 
                        active={profile.cloudSync} 
                        onToggle={() => setProfile((p:any) => ({...p, cloudSync: !p.cloudSync}))} 
                    />

                </div>
            </section>

            {/* BLOQUE 5: DATA MANAGEMENT & JOURNAL */}
            <section className="space-y-4 pt-2">
                <SectionHeader title="mi registro" icon="history_edu" />
                
                {/* BOTÓN DIARIO */}
                <button 
                    onClick={() => navigate('/journal')}
                    className="w-full liquid-glass rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group hover:bg-white/5 mb-2"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                            <span className="material-symbols-outlined text-neutral-400 text-xl group-hover:text-white transition-colors">auto_stories</span>
                        </div>
                        <div className="text-left">
                            <span className="text-lg font-bold text-white leading-none block">24</span>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">entradas de diario</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-neutral-500 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 px-4 rounded-2xl border border-white/10 text-xs font-bold text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">download</span>
                        exportar data
                    </button>
                    <button className="py-4 px-4 rounded-2xl border border-red-900/30 text-xs font-bold text-red-400 bg-red-900/5 hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">delete</span>
                        resetear
                    </button>
                </div>
            </section>

            {/* BLOQUE 6: PREMIUM */}
            <section className="relative overflow-hidden rounded-[2rem] p-1 mt-4">
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

            {/* LEGAL / FOOTER */}
            <footer className="pt-8 pb-4 flex flex-col items-center gap-4 opacity-40">
                <div className="flex gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <button onClick={() => navigate('/support')} className="hover:text-white">soporte</button>
                    <button onClick={() => navigate('/terms')} className="hover:text-white">términos</button>
                    <button onClick={() => navigate('/privacy-policy')} className="hover:text-white">privacidad</button>
                </div>
                <span className="text-[9px] text-neutral-700">v1.0.5 (build 205)</span>
            </footer>

            {/* Espacio extra para el BottomNav */}
            <div className="h-10" />

        </div>
      </div>

      {/* MODAL IA: DISCOVERY */}
      {showIkigaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300">
              <div className="w-full max-w-sm liquid-glass-heavy rounded-[2.5rem] p-8 relative overflow-hidden">
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
                              placeholder="ej: resolver problemas complejos, crear música..."
                              className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-neutral-600 border border-white/5 outline-none focus:border-purple-500/50 transition-colors resize-none text-sm lowercase"
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
    <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-neutral-600 text-lg">{icon}</span>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold">{title}</h3>
    </div>
);

const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-2" />
);

const ToggleRow = ({ icon, label, sublabel, active, onToggle }: { icon: string, label: string, sublabel?: string, active: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
             <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-white text-black' : 'bg-white/5 text-neutral-500'}`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
             </div>
             <div>
                <p className={`text-sm font-bold transition-colors ${active ? 'text-white' : 'text-neutral-400'}`}>{label}</p>
                {sublabel && <p className="text-[10px] text-neutral-600 mt-0.5 font-medium uppercase tracking-wide">{sublabel}</p>}
             </div>
        </div>
        <ToggleSwitch active={active} />
    </div>
);

const ToggleSwitch = ({ active }: { active: boolean }) => (
    <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-emerald-500' : 'bg-neutral-800 border border-white/10'}`}>
        <div className={`absolute top-0.5 size-5 rounded-full transition-all duration-300 shadow-sm ${active ? 'left-5 bg-white' : 'left-0.5 bg-neutral-500'}`} />
    </div>
);

export default Privacy;
