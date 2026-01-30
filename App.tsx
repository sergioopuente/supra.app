
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './screens/Welcome';
import Auth from './screens/Auth';
import Needs from './screens/Needs';
import Dashboard from './screens/Dashboard';
import Tracker from './screens/Tracker';
import Reflection from './screens/Reflection'; // Ahora actúa como "Journal"
import Privacy from './screens/Privacy';
import Suggestion from './screens/Suggestion';
import MentorChat from './screens/MentorChat';
import Challenges from './screens/Challenges';
import Terms from './screens/Terms';
import PrivacyPolicy from './screens/PrivacyPolicy';
import Support from './screens/Support';
import PrayerSession from './screens/PrayerSession';
import MeditationSession from './screens/MeditationSession';
import PremiumPaywall from './screens/PremiumPaywall';
import Community from './screens/Community';
import MentorFloatingButton from './components/MentorFloatingButton';
import FeedbackModal from './components/FeedbackModal';
import { Analytics, EVENTS } from './utils/Analytics';

const App: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  // Inicialización Global
  useEffect(() => {
    // 1. Analytics
    Analytics.init();
    Analytics.track(EVENTS.APP_OPEN);

    // 2. Theme & Performance Mode
    try {
        const savedProfile = localStorage.getItem('supra_profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            
            // Light/Dark Mode
            if (profile.darkMode === false) {
                document.documentElement.classList.add('light-mode');
            } else {
                document.documentElement.classList.remove('light-mode');
            }

            // Performance Mode Manual Override
            if (profile.performanceMode === true) {
                document.documentElement.classList.add('performance-mode');
            } else if (profile.performanceMode === false) {
                document.documentElement.classList.remove('performance-mode');
            }
        } else {
            // AUTO DETECTION FOR NEW USERS
            // Heurística: Si tiene 4 o menos hilos lógicos, es probable que sea gama baja/media.
            // O si es un agente Android genérico (simplificación).
            const cores = navigator.hardwareConcurrency || 4;
            const isLowEnd = cores <= 4;
            
            if (isLowEnd) {
                console.log("⚡ Supra: Low-end device detected. Activating Performance Mode.");
                document.documentElement.classList.add('performance-mode');
                // Guardar preferencia por defecto
                localStorage.setItem('supra_performance_mode_auto', 'true');
            }
        }
    } catch (e) {
        console.error("Error initializing app preferences", e);
    }

    // 3. Feedback Loop Check (7 Days)
    const checkFeedback = () => {
        const hasRated = localStorage.getItem('supra_has_rated');
        if (hasRated) return;

        const days = Analytics.getDaysSinceInstall();
        // Mostrar si lleva más de 3 días (para la demo) o 7 días (prod)
        if (days >= 3) {
             setTimeout(() => setShowFeedback(true), 5000);
        }
    };
    checkFeedback();

  }, []);

  return (
    <Router>
      <div className="max-w-md mx-auto h-screen relative bg-black overflow-hidden flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/journal" element={<Reflection />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/community" element={<Community />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/suggestion" element={<Suggestion />} />
          <Route path="/mentor" element={<MentorChat />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/prayer" element={<PrayerSession />} />
          <Route path="/meditation" element={<MeditationSession />} />
          <Route path="/premium" element={<PremiumPaywall />} />
        </Routes>
        
        <MentorFloatingButton />
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      </div>
    </Router>
  );
};

export default App;
