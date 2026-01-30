import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MentorFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper para determinar el contexto
  const getContextHint = (path: string) => {
    switch(path) {
        case '/journal': return 'claridad';
        case '/challenges': return 'disciplina';
        case '/tracker': return 'apoyo';
        case '/dashboard': return 'guía';
        default: return 'ayuda';
    }
  };

  const contextHint = getContextHint(location.pathname);

  // Ocultar en rutas específicas
  const hideOn = ['/', '/auth', '/needs', '/suggestion', '/mentor', '/meditation', '/prayer'];
  const shouldHide = hideOn.includes(location.pathname);

  if (shouldHide) return null;

  // --- SOS LOGIC ---
  const handleStartPress = (e: React.TouchEvent | React.MouseEvent) => {
      // Prevent default to avoid context menus on mobile
      // e.preventDefault(); 
      setIsPressing(true);
      
      // Start Haptic Build-up pattern
      if (navigator.vibrate) navigator.vibrate([10, 50, 10, 50]);

      pressTimer.current = setTimeout(() => {
          // LONG PRESS TRIGGERED
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Heavy confirmation
          navigate('/meditation?mode=sos');
          setIsPressing(false);
      }, 1000); // 1 second hold for SOS
  };

  const handleEndPress = () => {
      if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
      }
      if (isPressing) {
          // Was a short press, navigate to normal chat
          setIsPressing(false);
          navigate('/mentor');
      }
  };

  return (
    <>
      <style>
        {`
          @keyframes orb-breathe {
            0%, 100% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); }
            50% { box-shadow: 0 0 40px rgba(100, 200, 255, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2); }
          }
          @keyframes sos-pulse {
            0%, 100% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.2); transform: scale(1.1); }
            50% { box-shadow: 0 0 60px rgba(245, 158, 11, 0.6), inset 0 0 40px rgba(245, 158, 11, 0.4); transform: scale(1.2); }
          }
          @keyframes enter-from-bottom-left {
            0% { opacity: 0; transform: translate(-60px, 60px) scale(0.5) rotate(-45deg); filter: blur(10px); }
            100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); filter: blur(0px); }
          }
        `}
      </style>
      
      <div 
        className="fixed bottom-28 right-6 z-[60]"
        style={{ animation: 'enter-from-bottom-left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
      >
        <div className="group relative flex items-center">
          {/* Context Tooltip - Hides when pressing */}
          {!isPressing && (
            <div className={`
                absolute right-full mr-5 px-4 py-2
                rounded-2xl liquid-glass
                text-white text-[10px] font-bold uppercase tracking-widest
                opacity-0 group-hover:opacity-100 transition-all duration-300
                translate-x-[10px] group-hover:translate-x-0
                whitespace-nowrap pointer-events-none z-20
            `}>
                {contextHint}
            </div>
          )}

          {/* SOS Label - Shows when pressing */}
          {isPressing && (
             <div className="absolute right-full mr-5 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse whitespace-nowrap">
                 mantén para sos...
             </div>
          )}

          <button
            onMouseDown={handleStartPress}
            onMouseUp={handleEndPress}
            onTouchStart={handleStartPress}
            onTouchEnd={handleEndPress}
            onMouseLeave={handleEndPress}
            className={`relative size-16 flex items-center justify-center rounded-full transition-all duration-300 ${isPressing ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
          >
              {/* 1. Glass Orb Container */}
              <div 
                className={`relative size-full rounded-full backdrop-blur-md border flex items-center justify-center overflow-hidden transition-colors duration-500 ${
                    isPressing 
                    ? 'bg-amber-500/20 border-amber-500/50' 
                    : 'bg-white/5 border-white/20'
                }`}
                style={{ 
                    animation: isPressing ? 'sos-pulse 0.5s ease-in-out infinite' : 'orb-breathe 4s ease-in-out infinite' 
                }}
              >
                  {/* 2. Inner Core */}
                  <div className={`absolute inset-0 transition-colors duration-500 opacity-80 blur-lg ${
                      isPressing 
                      ? 'bg-gradient-to-tr from-red-600/60 via-amber-500/60 to-orange-600/60' 
                      : 'bg-gradient-to-tr from-purple-500/30 via-cyan-400/20 to-blue-600/30'
                  }`} />

                  {/* 3. Specular Highlight */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full opacity-60 pointer-events-none" />
                  
                  {/* 5. Icon */}
                  <span className={`material-symbols-outlined text-[24px] relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors duration-300 ${isPressing ? 'text-amber-100' : 'text-white'}`}>
                    {isPressing ? 'spa' : 'auto_awesome'}
                  </span>
              </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default MentorFloatingButton;