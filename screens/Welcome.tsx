
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col gradient-mesh page-transition">
      <header className="pt-16 px-8 flex justify-between items-center">
        <span className="font-serif italic text-3xl tracking-tighter text-white">supra</span>
        <button 
          onClick={() => navigate('/auth')} 
          className="text-xs font-medium text-neutral-500 hover:text-white transition-colors uppercase tracking-wide"
        >
          entrar
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <div className="relative w-72 h-72 mb-12">
            <div className="absolute inset-0 bg-white/5 rounded-full scale-[1.3] animate-pulse"></div>
            <div className="absolute inset-0 border border-white/10 rounded-full scale-110"></div>
            <div className="w-full h-full rounded-full overflow-hidden grayscale contrast-125 border-[0.5px] border-white/20 shadow-2xl relative z-10">
                <img 
                    src="https://picsum.photos/seed/stoic/800/800" 
                    alt="Stoic Art" 
                    className="w-full h-full object-cover opacity-80"
                />
            </div>
        </div>

        <div className="text-center max-w-sm space-y-4">
          <h1 className="text-4xl font-semibold tracking-tighter leading-[1.1] text-white lowercase">
            encuentra tu <br/>
            <span className="font-serif italic font-normal text-neutral-400">calma interior.</span>
          </h1>
          <p className="text-neutral-500 text-base font-normal leading-relaxed lowercase tracking-normal px-4">
            bienestar emocional para la nueva generación. simple, preventivo y empoderador.
          </p>
        </div>
      </div>

      <footer className="p-8 pb-12 space-y-6">
        <button 
          onClick={() => navigate('/auth')}
          className="group w-full h-16 bg-white text-black rounded-full font-semibold text-lg flex items-center justify-center hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-xl lowercase"
        >
          <span>comenzar</span>
          <span className="material-symbols-outlined ml-3 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p className="text-center text-[11px] text-neutral-600 font-medium uppercase tracking-wide leading-normal">
          basado en estoicismo moderno & psicología conductual
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
