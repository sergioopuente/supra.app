
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Suggestion: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-black lowercase overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 flex items-center justify-between border-b border-white/5 pb-4 apple-blur bg-black/60 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">evaluación completa</span>
        <div className="size-10" />
      </header>

      <main className="p-8 space-y-10 pb-40">
        <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white">tu primer paso sugerido</h1>
            <p className="text-neutral-500 text-lg leading-relaxed">
                según tus respuestas, creemos que esta actividad te traerá claridad mental inmediata.
            </p>
        </div>

        <div 
            onClick={() => navigate('/reflection')}
            className="bg-neutral-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl hover:border-white/20 transition-all cursor-pointer group"
        >
            <div className="aspect-[16/10] bg-neutral-800 relative overflow-hidden">
                <img 
                    src="https://picsum.photos/seed/river/600/400" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 right-6 bg-white/10 apple-blur border border-white/20 px-4 py-2 rounded-full">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">recomendado</span>
                </div>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-2 text-neutral-500">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-bold uppercase tracking-widest">duración ~5 min</span>
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">diario de gratitud</h3>
                <p className="text-neutral-400 text-lg leading-relaxed">
                    entrena tu mente para ver lo que sí tienes. este simple ejercicio cambia la química de tu cerebro en minutos.
                </p>
                <div className="pt-4 flex flex-wrap gap-2">
                    {['claridad', 'enfoque', 'paz'].map(t => (
                        <span key={t} className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs text-neutral-400 font-bold">{t}</span>
                    ))}
                </div>
            </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
        <div className="space-y-4">
            <button 
                onClick={() => navigate('/reflection')}
                className="w-full h-16 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
            >
                <span>empezar ahora</span>
                <span className="material-symbols-outlined">bolt</span>
            </button>
            <button 
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 text-neutral-500 hover:text-white font-bold text-sm transition-all"
            >
                explorar otras opciones
            </button>
        </div>
      </footer>
    </div>
  );
};

export default Suggestion;
