
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics, EVENTS } from '../utils/Analytics';

const Needs: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // State Data
  const [mood, setMood] = useState(50);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [name, setName] = useState('');

  const goals = [
    { id: 'ansiedad', icon: 'cloud', title: 'reducir ansiedad', desc: 'busco calma mental' },
    { id: 'foco', icon: 'bolt', title: 'productividad', desc: 'quiero lograr más' },
    { id: 'proposito', icon: 'north_east', title: 'propósito', desc: 'me siento perdido' },
    { id: 'dormir', icon: 'bedtime', title: 'dormir mejor', desc: 'insomnio recurrente' },
  ];

  // Check for "Inverted Onboarding" data
  useEffect(() => {
      const preSelectedMood = localStorage.getItem('supra_onboarding_mood');
      if (preSelectedMood) {
          setMood(parseInt(preSelectedMood));
          setStep(2); // Skip Step 1
          localStorage.removeItem('supra_onboarding_mood'); // Clear it
      }
  }, []);

  const handleNext = () => {
    Analytics.track(EVENTS.ONBOARDING_STEP_COMPLETE, { step, goal: selectedGoal });
    
    if (step < 3) {
        setStep(step + 1);
    } else {
        // Save to LocalStorage for the Analysis Screen
        const onboardingData = {
            mood,
            goal: selectedGoal,
            name: name || 'viajero'
        };
        localStorage.setItem('supra_onboarding_temp', JSON.stringify(onboardingData));
        
        Analytics.track(EVENTS.ONBOARDING_COMPLETE, { goal: selectedGoal });
        Analytics.identify(name); // Vincular usuario a la sesión
        
        navigate('/suggestion');
    }
  };

  const isNextDisabled = () => {
      if (step === 2 && !selectedGoal) return true;
      if (step === 3 && !name.trim()) return true;
      return false;
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase selection:bg-white selection:text-black">
      
      {/* Background Ambient */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${step === 1 ? 'opacity-20 bg-blue-900' : step === 2 ? 'opacity-20 bg-purple-900' : 'opacity-20 bg-emerald-900'}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      {/* Progress Header */}
      <header className="px-8 pt-12 flex justify-between items-center relative z-20">
        <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} 
            className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
        >
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
            ))}
        </div>
        <div className="size-10" />
      </header>

      {/* Content Container */}
      <main className="flex-1 flex flex-col px-8 relative z-10 pt-10">
        
        {/* STEP 1: MOOD CALIBRATION (Only shown if coming from direct link, not Welcome) */}
        {step === 1 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">paso 1 de 3 • calibración</span>
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-4 leading-[1.1]">
                    ¿cómo sientes tu <br/> <span className="text-neutral-500">energía hoy?</span>
                </h1>
                
                <div className="flex-1 flex flex-col justify-center gap-12">
                    <div className="relative size-48 mx-auto bg-neutral-900/50 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_60px_rgba(255,255,255,0.05)]">
                        <span className={`material-symbols-outlined text-8xl text-white transition-all duration-300 ${mood < 30 ? 'opacity-40 blur-[1px]' : mood > 70 ? 'opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'opacity-70'}`}>
                            {mood > 80 ? 'bolt' : mood > 60 ? 'wb_sunny' : mood > 40 ? 'cloud' : 'nights_stay'}
                        </span>
                        <div className="absolute inset-0 rounded-full border border-white/10 scale-110 animate-[spin_10s_linear_infinite]" />
                    </div>

                    <div className="space-y-6">
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={mood} 
                            onChange={(e) => setMood(Number(e.target.value))}
                            className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            <span>agotado</span>
                            <span>imparable</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: GOAL SELECTION */}
        {step === 2 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">paso 2 de 3 • objetivo</span>
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-8 leading-[1.1]">
                    ¿cuál es tu <br/> <span className="text-neutral-500">batalla principal?</span>
                </h1>

                <div className="grid grid-cols-1 gap-4">
                    {goals.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGoal(g.id)}
                            className={`p-5 rounded-3xl border text-left flex items-center gap-5 transition-all duration-300 active:scale-[0.98] ${
                                selectedGoal === g.id 
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]' 
                                : 'bg-neutral-900/40 text-neutral-400 border-white/5 hover:bg-neutral-800 hover:border-white/10'
                            }`}
                        >
                            <div className={`size-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${selectedGoal === g.id ? 'bg-black text-white' : 'bg-white/5 text-neutral-500'}`}>
                                <span className="material-symbols-outlined text-xl">{g.icon}</span>
                            </div>
                            <div>
                                <h3 className="text-base font-bold leading-tight">{g.title}</h3>
                                <p className={`text-[10px] font-medium uppercase tracking-wide mt-1 ${selectedGoal === g.id ? 'text-neutral-600' : 'text-neutral-600'}`}>
                                    {g.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 3: IDENTITY */}
        {step === 3 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">paso 3 de 3 • identidad</span>
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-4 leading-[1.1]">
                    una última cosa. <br/> <span className="text-neutral-500">¿cómo te llamas?</span>
                </h1>
                
                <div className="flex-1 flex flex-col justify-center">
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="tu nombre..."
                        className="w-full bg-transparent border-b-2 border-white/20 py-4 text-3xl font-bold text-white placeholder-neutral-700 outline-none focus:border-white transition-colors text-center"
                        autoFocus
                    />
                    <p className="text-center mt-6 text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                        usaremos esto para personalizar tu mentor ia. tu privacidad es absoluta.
                    </p>
                </div>
            </div>
        )}

        {/* Floating Action Button */}
        <div className="pb-10 pt-4">
            <button 
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="w-full h-16 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
            >
                <span>{step === 3 ? 'finalizar' : 'continuar'}</span>
                <span className="material-symbols-outlined">{step === 3 ? 'check' : 'arrow_forward'}</span>
            </button>
        </div>

      </main>
    </div>
  );
};

export default Needs;
