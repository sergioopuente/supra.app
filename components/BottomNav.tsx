
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'home' },
    { path: '/tracker', icon: 'sentiment_satisfied', label: 'check-in' },
    { path: '/challenges', icon: 'trophy', label: 'retos' },
    { path: '/journal', icon: 'book_2', label: 'diario' },
    { path: '/privacy', icon: 'person', label: 'perfil' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] rounded-[2.5rem] liquid-glass-heavy p-1.5 backdrop-blur-3xl">
      <ul className="flex items-center justify-between relative px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="flex-1 flex justify-center">
              <button
                onClick={() => navigate(item.path)}
                className={`group flex flex-col items-center justify-center transition-all duration-300 relative py-3 w-full`}
              >
                <div className={`relative flex items-center justify-center rounded-2xl transition-all duration-500 ease-out ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
                    {/* Active Light Glow Background */}
                    {isActive && (
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                    )}
                    
                    <span 
                        className={`material-symbols-outlined text-[24px] z-10 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-neutral-500 group-hover:text-white/80'}`}
                        style={{ 
                            fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" 
                        }}
                    >
                        {item.icon}
                    </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
