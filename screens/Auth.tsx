
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'options' | 'email'>('options');

  // Simular Haptic Feedback de Expo
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleGuest = () => {
    triggerHaptic();
    navigate('/needs');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        navigate('/needs');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden font-sans selection:bg-purple-500/30">
        
        {/* CAPA 0: FONDO DE VIDEO */}
        <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none scale-105"
        >
            <source src="https://cdn.pixabay.com/video/2020/05/25/40149-424078833_large.mp4" type="video/mp4" />
        </video>

        {/* CAPA 0.5: GRADIENTE DE INMERSIÓN (Simulando LinearGradient) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-0" />

        {/* CAPA 1: BRANDING SUPERIOR */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-32">
            <span className="font-serif italic text-4xl tracking-tighter text-white drop-shadow-lg mb-2">supra</span>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.3em] drop-shadow-md">
                domina tu mente.
            </p>
        </div>

        {/* CAPA 2: PANEL DE INTERACCIÓN (GLASS SHEET) */}
        {/* Simula un BottomSheet nativo con BlurView */}
        <div className="relative z-20 bg-neutral-900/80 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom-10 duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Indicador de "Drag" visual (Affordance) */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />

            {mode === 'options' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* BOTONES SOCIALES */}
                    <button 
                        onClick={() => triggerHaptic()}
                        className="w-full h-14 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="h-4 w-4" alt="Apple" />
                        <span>continuar con apple</span>
                    </button>

                    <button 
                        onClick={() => triggerHaptic()}
                        className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-4 w-4 grayscale invert brightness-200" alt="Google" />
                        <span>continuar con google</span>
                    </button>

                    {/* SEPARADOR */}
                    <div className="relative py-4 flex items-center justify-center">
                        <div className="w-full border-t border-white/5 absolute" />
                        <span className="bg-transparent px-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest relative z-10">
                            o usa tu correo
                        </span>
                    </div>

                    <button 
                        onClick={() => { triggerHaptic(); setMode('email'); }}
                        className="w-full h-12 text-neutral-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        iniciar sesión / registro
                    </button>

                    <button 
                         onClick={handleGuest}
                         className="w-full text-[10px] text-neutral-600 font-bold uppercase tracking-widest hover:text-neutral-400 pt-2 transition-colors"
                    >
                        continuar como invitado
                    </button>
                </div>
            ) : (
                /* VISTA DE EMAIL */
                <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                    
                    <div className="space-y-4">
                        <div className="group bg-white/5 rounded-2xl px-5 py-3 border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-all">
                            <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 group-focus-within:text-white/60">email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-transparent border-none text-white outline-none text-base font-medium placeholder-neutral-700"
                                placeholder="tu@email.com"
                                autoFocus
                            />
                        </div>

                        <div className="group bg-white/5 rounded-2xl px-5 py-3 border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-all">
                            <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 group-focus-within:text-white/60">contraseña</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-transparent border-none text-white outline-none text-base font-medium placeholder-neutral-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* ACTION BUTTON - NEON GRADIENT */}
                    <button 
                        type="submit"
                        disabled={loading || !email}
                        className="w-full h-14 rounded-2xl font-bold text-sm text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 border border-white/10"
                    >
                        {loading ? (
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>ENTRAR</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { triggerHaptic(); setMode('options'); }}
                        className="w-full text-center text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                        volver
                    </button>
                </form>
            )}

            {/* PRIVACY FOOTER */}
            <p className="mt-8 text-center text-[9px] text-neutral-600 max-w-[200px] mx-auto leading-relaxed">
                al entrar, aceptas nuestra política de <span className="text-neutral-500 underline cursor-pointer">privacidad radical</span>. tus datos están encriptados.
            </p>
        </div>
    </div>
  );
};

export default Auth;
