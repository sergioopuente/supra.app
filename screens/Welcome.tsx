
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../utils/Translations';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState(50);
  const [insight, setInsight] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Local Micro-Insights based on Mood (0 Latency)
  const getInsight = (val: number) => {
      if (val < 20) return "la oscuridad es solo ausencia de luz. empieza aquí.";
      if (val < 40) return "aceptar el caos es el primer paso del orden.";
      if (val < 60) return "estás en equilibrio. inclínate hacia el propósito.";
      if (val < 80) return "usa esta energía para construir, no solo para sentir.";
      return "eres imparable. lidera con el ejemplo hoy.";
  };

  useEffect(() => {
      setInsight(getInsight(mood));
  }, [mood]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMood(Number(e.target.value));
      if (!hasInteracted) setHasInteracted(true);
  };

  const handleContinue = () => {
      // Save mood to local storage to be picked up by Needs.tsx
      localStorage.setItem('supra_onboarding_mood', mood.toString());
      
      // Navigate directly to Needs step 2 (skipping the mood question)
      navigate('/needs');
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans page-transition">
      
      {/* Dynamic Background based on Mood */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-out opacity-20 pointer-events-none"
        style={{
            background: `radial-gradient(circle at 50% 50%, 
                ${mood < 30 ? 'rgba(75, 85, 99, 0.4)' : mood < 70 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)'} 0%, 
                transparent 70%)`
        }} 
      />
      
      <header className="pt-16 px-8 flex justify-between items-center z-20">
        <span className="font-serif italic text-3xl tracking-tighter text-white">supra</span>
        <button 
          onClick={() => navigate('/auth')} 
          className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-widest"
        >
          {t('welcome.enter')}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        
        {/* Interactive Centerpiece */}
        <div className="w-full max-w-sm space-y-12">
            
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tighter leading-[1.1]">
                    ¿cómo sientes tu <br/>
                    <span className={`transition-colors duration-500 ${mood < 40 ? 'text-neutral-500' : mood > 70 ? 'text-amber-400' : 'text-blue-400'}`}>
                        energía ahora?
                    </span>
                </h1>
                
                {/* Instant Insight - The "Value Hook" */}
                <p className={`text-sm font-medium leading-relaxed transition-all duration-500 h-10 ${hasInteracted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} text-neutral-300`}>
                    "{insight}"
                </p>
            </div>

            {/* Slider Component */}
            <div className="relative h-64 w-24 mx-auto">
                {/* Vertical Slider Track */}
                <div className="absolute inset-x-[46%] top-0 bottom-0 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                        className={`absolute bottom-0 w-full transition-all duration-100 ease-out ${mood < 40 ? 'bg-neutral-600' : mood > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ height: `${mood}%` }}
                    />
                </div>
                
                {/* Thumb Icon */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 size-16 rounded-full bg-black border border-white/20 shadow-2xl flex items-center justify-center transition-all duration-100 ease-out pointer-events-none"
                    style={{ bottom: `calc(${mood}% - 32px)` }}
                >
                    <span className={`material-symbols-outlined text-2xl transition-colors duration-300 ${mood < 40 ? 'text-neutral-400' : mood > 70 ? 'text-amber-400' : 'text-blue-400'}`}>
                        {mood > 80 ? 'bolt' : mood > 60 ? 'wb_sunny' : mood > 40 ? 'cloud' : 'nights_stay'}
                    </span>
                </div>

                {/* Actual Input (Vertical trick) */}
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={mood}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} // Hack for horizontal slider behaving vertically if needed, but styling vertical range is hard cross-browser. 
                    // Better approach for standard range: use a wide container and css grid overlay.
                    // For this snippet, assuming standard horizontal slider styled vertically or standard horizontal.
                    // LET'S STICK TO HORIZONTAL FOR STABILITY, BUT VISUALLY VERTICAL IS COOLER.
                    // Reverting to Horizontal for stability in this code block:
                />
            </div>
            
            {/* Fallback to Horizontal for guaranteed functionality in snippet */}
            <div className="space-y-6 pt-8">
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={mood}
                    onChange={handleSliderChange}
                    className="w-full h-12 bg-transparent opacity-0 absolute inset-0 z-20 cursor-pointer"
                 />
                 {/* Visual Horizontal Representation if the vertical one is tricky without external libs */}
                 <div className="relative h-2 bg-neutral-800 rounded-full w-full">
                     <div 
                        className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-100 ${mood < 40 ? 'bg-neutral-600' : mood > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${mood}%` }}
                     />
                     <div 
                        className="absolute top-1/2 -translate-y-1/2 size-8 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-100"
                        style={{ left: `calc(${mood}% - 16px)` }}
                     >
                         <div className="size-2 bg-black rounded-full" />
                     </div>
                 </div>
                 <div className="flex justify-between text-[9px] font-bold text-neutral-600 uppercase tracking-widest px-1">
                    <span>agotado</span>
                    <span>imparable</span>
                 </div>
            </div>

        </div>
      </div>

      <footer className="p-8 pb-12 space-y-6 relative z-20">
        <button 
          onClick={handleContinue}
          className="group w-full h-16 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] lowercase"
        >
          <span>continuar</span>
          <span className="material-symbols-outlined ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
          tu primer paso hacia el dominio propio
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
