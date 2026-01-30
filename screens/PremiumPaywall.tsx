
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumPaywall: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Simular proceso de pago
    setTimeout(() => {
        // Actualizar perfil a Premium en LocalStorage
        const savedProfile = localStorage.getItem('supra_profile');
        let profile = savedProfile ? JSON.parse(savedProfile) : {};
        profile.isPremium = true;
        profile.spiritualMode = true; // Desbloquear feature al comprar
        localStorage.setItem('supra_profile', JSON.stringify(profile));
        
        setLoading(false);
        navigate('/dashboard'); // Volver al inicio como rey
    }, 1500);
  };

  const features = [
    { icon: 'graphic_eq', title: 'Conversación Fluida', desc: 'Habla con tu mentor sin límites ni cortes.' },
    { icon: 'center_focus_strong', title: 'Claridad Visual', desc: 'Sube fotos de tu entorno para obtener nuevas perspectivas.' },
    { icon: 'wb_incandescent', title: 'Modo Lux (Espiritual)', desc: 'Desbloquea oraciones y contenido profundo.' },
    { icon: 'download', title: 'Propiedad de Datos', desc: 'Exporta tu diario y patrones completos.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans animate-in slide-in-from-bottom duration-500">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-black" />
        <div className="absolute top-[-20%] right-[-20%] size-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-12 left-6 size-10 rounded-full bg-white/10 flex items-center justify-center text-white z-50 backdrop-blur-md"
        >
            <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-6 pt-24 pb-32">
            
            {/* Header Branding */}
            <div className="text-center mb-12 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em]">membresía exclusiva</span>
                <h1 className="text-5xl font-serif italic text-white tracking-tighter">supra <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-neutral-600">black</span></h1>
                <p className="text-neutral-400 text-sm max-w-[200px] mx-auto pt-2">la herramienta definitiva para el dominio propio.</p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">{f.icon}</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm leading-tight">{f.title}</h3>
                            <p className="text-neutral-500 text-xs leading-tight mt-1">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-12 bg-neutral-900/50 rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">comparativa</span>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-neutral-500">gratis</span>
                        <span className="text-white">black</span>
                    </div>
                </div>
                {[
                    { l: 'voz fluida', f: 'no', p: 'sí' },
                    { l: 'sesiones guía', f: '1/día', p: '∞' },
                    { l: 'análisis visual', f: 'no', p: 'sí' },
                ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-400 font-medium">{row.l}</span>
                        <div className="flex gap-10 text-sm font-bold">
                            <span className="text-neutral-600 w-8 text-center">{row.f}</span>
                            <span className="text-white w-8 text-center">{row.p}</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>

        {/* Floating CTA */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
            <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full h-16 rounded-full bg-white text-black font-bold text-lg flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all relative overflow-hidden group"
            >
                {loading ? (
                    <div className="size-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10 flex items-center gap-2">
                            desbloquear todo
                            <span className="material-symbols-outlined text-xl">lock_open</span>
                        </span>
                        <span className="relative z-10 text-[10px] uppercase tracking-widest font-medium opacity-60">4,99€ / mes • cancela cuando quieras</span>
                    </>
                )}
            </button>
            <button onClick={() => navigate(-1)} className="w-full text-center mt-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest hover:text-white transition-colors">
                restaurar compras
            </button>
        </div>

        <style>{`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
  );
};

export default PremiumPaywall;
