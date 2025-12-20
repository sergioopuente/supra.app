
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('buenos días');
    else if (hours < 20) setGreeting('buenas tardes');
    else setGreeting('buenas noches');

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('es-ES', options));
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative page-transition font-sans lowercase selection:bg-white selection:text-black">
      
      {/* 0. CAPA ATMOSFÉRICA (VIDEO BG) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none scale-105"
      >
        <source src="https://cdn.pixabay.com/video/2020/05/25/40149-424078833_large.mp4" type="video/mp4" />
      </video>

      {/* Gradiente de legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 z-0 pointer-events-none" />

      {/* CONTENIDO PRINCIPAL - CENTRO DE MANDO */}
      <div className="flex-1 flex flex-col relative z-10 px-6 pt-14 pb-32 overflow-y-auto no-scrollbar">
        
        {/* BLOQUE 1: CONTEXTO HUMANO */}
        <header className="flex justify-between items-start mb-10">
            <div className="space-y-1">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{dateStr}</p>
                <h1 className="text-4xl font-semibold text-white tracking-tighter leading-[1.1]">
                    {greeting}, <br/>
                    <span className="text-white/60">alex.</span>
                </h1>
            </div>
            {/* Status Pill - Liquid Glass */}
            <div className="liquid-glass px-3 py-1.5 rounded-full flex items-center gap-2">
                 <div className="size-2 bg-neutral-500 rounded-full" />
                 <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">pendiente</span>
            </div>
        </header>

        {/* BLOQUE 2: ACCIÓN PRINCIPAL (Main CTA) - ALTO CONTRASTE */}
        {/* Usamos fondo BLANCO sólido para jerarquía máxima sobre el vidrio */}
        <section className="mb-8">
            <button 
                onClick={() => navigate('/tracker')}
                className="group relative w-full h-36 bg-white rounded-[2.2rem] p-8 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-300"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 size-32 bg-neutral-100 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
                
                <div className="relative z-10 flex justify-between items-start w-full">
                    <div className="flex flex-col items-start space-y-2">
                        <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-bold uppercase tracking-widest">prioridad</span>
                        <h2 className="text-2xl font-bold text-black tracking-tight leading-none">sincronizar<br/>mente</h2>
                    </div>
                    <div className="size-10 rounded-full bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-xl">arrow_outward</span>
                    </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-neutral-500">
                    <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                    <span className="text-xs font-medium tracking-wide">registro de estado pendiente</span>
                </div>
            </button>
        </section>

        {/* BLOQUE 3: INTELIGENCIA (RECOMENDACIÓN ÚNICA) - LIQUID GLASS */}
        <section className="mb-6">
            <div className="liquid-glass rounded-[2rem] p-1 overflow-hidden relative group">
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-purple-300 text-lg drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">auto_awesome</span>
                        <span className="text-[10px] font-bold text-purple-200 uppercase tracking-[0.2em]">para ti hoy</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">meditación de 3 min</h3>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed mb-6 max-w-[90%]">
                        tu historial muestra picos de estrés por la tarde. un reset breve ahora mejorará tu foco.
                    </p>

                    <button 
                        onClick={() => navigate('/suggestion')}
                        className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <span className="text-xs font-bold text-white uppercase tracking-widest">comenzar</span>
                        <span className="material-symbols-outlined text-xs text-white">play_arrow</span>
                    </button>
                </div>
            </div>
        </section>

        {/* BLOQUE 4: PROGRESO MINI - LIQUID GLASS LOZENGES */}
        <section className="grid grid-cols-2 gap-4">
            <div className="liquid-glass rounded-[1.8rem] p-5 flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-neutral-400 text-2xl mb-1">local_fire_department</span>
                <span className="text-2xl font-bold text-white leading-none">12</span>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">días racha</span>
            </div>
            
            <div 
                onClick={() => navigate('/journal')}
                className="liquid-glass rounded-[1.8rem] p-5 flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
                <span className="material-symbols-outlined text-neutral-400 text-2xl mb-1">history_edu</span>
                <span className="text-2xl font-bold text-white leading-none">24</span>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">entradas</span>
            </div>
        </section>

      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
