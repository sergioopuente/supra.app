
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Needs: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(['calma']);

  const needs = [
    { id: 'calma', icon: 'cloud', title: 'calma', subtitle: 'manejar ansiedad' },
    { id: 'descanso', icon: 'bedtime', title: 'descanso', subtitle: 'dormir mejor' },
    { id: 'tribu', icon: 'diversity_3', title: 'tribu', subtitle: 'conectar' },
    { id: 'energia', icon: 'bolt', title: 'energía', subtitle: 'motivación' },
    { id: 'fuerza', icon: 'shield', title: 'fuerza', subtitle: 'resiliencia' },
    { id: 'mente', icon: 'psychology', title: 'mente', subtitle: 'autoconocimiento' },
  ];

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 flex flex-col bg-black lowercase">
      <header className="px-6 pt-12 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i===1 ? 'w-8 bg-white' : 'w-1.5 bg-neutral-800'}`} />)}
        </div>
        <div className="size-10" />
      </header>

      <div className="px-8 mt-12 mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">¿qué necesitas hoy?</h1>
        <p className="text-neutral-500 text-lg font-light">selecciona las metas que resuenen contigo.</p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto no-scrollbar pb-40">
        <div className="grid grid-cols-2 gap-4">
            {needs.map(need => (
                <button 
                    key={need.id}
                    onClick={() => toggle(need.id)}
                    className={`h-48 rounded-[2.5rem] p-6 flex flex-col justify-between transition-all active:scale-95 border-2 ${
                        selected.includes(need.id) 
                            ? 'bg-white text-black border-white shadow-2xl' 
                            : 'bg-neutral-900 text-white border-white/5 opacity-60'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`material-symbols-outlined text-4xl ${selected.includes(need.id) ? 'icon-filled' : ''}`}>
                            {need.icon}
                        </span>
                        {selected.includes(need.id) && <span className="material-symbols-outlined text-xl">check_circle</span>}
                    </div>
                    <div className="text-left">
                        <p className="text-lg font-bold leading-tight">{need.title}</p>
                        <p className={`text-xs mt-1 ${selected.includes(need.id) ? 'text-black/60' : 'text-neutral-500'}`}>{need.subtitle}</p>
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div className="fixed bottom-12 right-8 z-50">
        <button 
            onClick={() => navigate('/suggestion')}
            className="size-20 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
            <span className="material-symbols-outlined text-4xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default Needs;
