
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MentorFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contextHint, setContextHint] = useState('mentor ai');

  // Ocultar solo en onboarding
  const hideOn = ['/', '/needs', '/suggestion'];
  if (hideOn.includes(location.pathname)) return null;

  // Lógica contextual
  useEffect(() => {
    switch(location.pathname) {
        case '/journal': setContextHint('analizar mente'); break;
        case '/challenges': setContextHint('coach de hábitos'); break;
        case '/tracker': setContextHint('apoyo emocional'); break;
        default: setContextHint('guía estoico');
    }
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
          @keyframes orb-breathe {
            0%, 100% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); }
            50% { box-shadow: 0 0 40px rgba(100, 200, 255, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2); }
          }
        `}
      </style>
      
      <div className="fixed bottom-28 left-6 z-[60]">
        <div className="group relative flex items-center">
          {/* Context Tooltip (Glass Style) */}
          <div className={`
              absolute left-full ml-5 px-4 py-2
              rounded-2xl liquid-glass
              text-white text-[10px] font-bold uppercase tracking-widest
              opacity-0 group-hover:opacity-100 transition-all duration-300
              translate-x-[-10px] group-hover:translate-x-0
              whitespace-nowrap pointer-events-none z-20
          `}>
              {contextHint}
          </div>

          <button
            onClick={() => navigate('/mentor')}
            className="relative size-16 flex items-center justify-center rounded-full transition-all duration-500 hover:scale-105 active:scale-95"
          >
              {/* 1. Glass Orb Container */}
              <div 
                className="relative size-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden"
                style={{ animation: 'orb-breathe 4s ease-in-out infinite' }}
              >
                  {/* 2. Inner Colorful Core (Subtle) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-cyan-400/20 to-blue-600/30 opacity-80 blur-lg" />

                  {/* 3. Specular Highlight (The Apple Gloss) */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full opacity-60 pointer-events-none" />
                  
                  {/* 4. Bottom Reflection */}
                  <div className="absolute bottom-1 right-2 w-2/3 h-1/3 bg-gradient-to-t from-white/20 to-transparent rounded-b-full blur-sm pointer-events-none" />

                  {/* 5. Icon */}
                  <span className="material-symbols-outlined text-white text-[24px] relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    auto_awesome
                  </span>
              </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default MentorFloatingButton;
