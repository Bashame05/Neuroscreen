import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import ScreeningParkinsons from './pages/ScreeningParkinsons';
import ScreeningAlzheimers from './pages/ScreeningAlzheimers';
import ScreeningEpilepsy from './pages/ScreeningEpilepsy';
import ReactionTimeTest from './pages/ReactionTimeTest';
import EpilepsyCombinedResults from './pages/EpilepsyCombinedResults';
import FingerTappingTest from './pages/FingerTappingTest';
import VisionContrastTest from './pages/VisionContrastTest';
import MSCombinedResults from './pages/MSCombinedResults';
import ReportPage from './pages/ReportPage';
import Screenings from './pages/Screenings';
import About from './pages/About';
import GetHelp from './pages/GetHelp';
import Feedback from './pages/Feedback';

const App = () => {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileSnap = await getDoc(doc(db, 'users', currentUser.uid));
          setHasProfile(profileSnap.exists());
        } catch {
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-3)',
        color: 'var(--primary)',
        fontSize: '1.2rem',
        fontFamily: 'var(--font-heading)'
      }}>
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-grid"></div>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
        >
          Loading NeuroScreen...
        </motion.div>
      </div>
    );
  }

  // Redirect authenticated users: if no profile → profile-setup, else → dashboard
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (!hasProfile) return <Navigate to="/profile-setup" />;
    return children;
  };

  // Profile setup is only for authenticated users without a profile
  const ProfileRoute = () => {
    if (!user) return <Navigate to="/login" />;
    if (hasProfile) return <Navigate to="/dashboard" />;
    return <ProfileSetup onComplete={() => setHasProfile(true)} />;
  };

  // Login page redirects based on profile status
  const LoginRoute = () => {
    if (!user) return <Login />;
    return hasProfile ? <Navigate to="/dashboard" /> : <Navigate to="/profile-setup" />;
  };

  return (
    <Router>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-grid"></div>
      <Navbar />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/profile-setup" element={<ProfileRoute />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/screening/parkinsons" element={<ProtectedRoute><ScreeningParkinsons /></ProtectedRoute>} />
          <Route path="/screening/alzheimers" element={<ProtectedRoute><ScreeningAlzheimers /></ProtectedRoute>} />
          <Route path="/screening/epilepsy" element={<ProtectedRoute><ScreeningEpilepsy /></ProtectedRoute>} />
          <Route path="/screening/epilepsy/reaction" element={<ProtectedRoute><ReactionTimeTest /></ProtectedRoute>} />
          <Route path="/screening/epilepsy/results" element={<ProtectedRoute><EpilepsyCombinedResults /></ProtectedRoute>} />
          <Route path="/screening/ms/tapping" element={<ProtectedRoute><FingerTappingTest /></ProtectedRoute>} />
          <Route path="/screening/ms/vision" element={<ProtectedRoute><VisionContrastTest /></ProtectedRoute>} />
          <Route path="/screening/ms/results" element={<ProtectedRoute><MSCombinedResults /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/screenings" element={<ProtectedRoute><Screenings /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><GetHelp /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
