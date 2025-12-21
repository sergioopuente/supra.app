
import React from 'react';
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
import MentorFloatingButton from './components/MentorFloatingButton';

const App: React.FC = () => {
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
          <Route path="/reflection" element={<Reflection />} /> {/* Fallback compatibility */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/suggestion" element={<Suggestion />} />
          <Route path="/mentor" element={<MentorChat />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/prayer" element={<PrayerSession />} />
          <Route path="/meditation" element={<MeditationSession />} />
        </Routes>
        <MentorFloatingButton />
      </div>
    </Router>
  );
};

export default App;
