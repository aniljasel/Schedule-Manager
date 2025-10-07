import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from "./components/header";
import About from "./components/about";
import Hero from "./components/hero";
import Updates from "./components/updates";
import HelpSupport from "./components/HelpSupport";
import LoginPopup from "./components/LoginPopup";
import RegisterPopup from "./components/RegisterPopup";
import LandingPage from "./components/LandingPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import ManageMeetings from "./components/MeetingRoom";
import VideoCall from "./components/VideoCall";

function App() {
  // About, Updates, Help&Support, login register, and privacy policy
  const [showAbout, setShowAbout] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
  });
    return () => unsub();
  }, []);

  const handleAbout = (e) => {
    e.preventDefault();
    setShowAbout((prev) => !prev);
  };

  const handleUpdates = (e) => {
    e.preventDefault();
    setShowUpdates((prev) => !prev);
  };

  const handleHelp = (e) => {
    e.preventDefault();
    setShowHelp((prev) => !prev);
  };

  // ------------------
  if (!user) {
  return (
      <>
        {showAbout && <div className="blur-overlay"></div>}
        <LandingPage
          onLogin={() => setShowLogin(true)}
          onRegister={() => setShowRegister(true)}
          onPrivacy={() => setShowPrivacy(true)}
          onAbout={handleAbout}
        />
        {showLogin && (
          <LoginPopup
            onClose={() => setShowLogin(false)}
            onRegisterClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}
        {showRegister && (
          <RegisterPopup
            onClose={() => setShowRegister(false)}
            onLoginClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
        {showAbout && (
          <About
            onClose={() => setShowAbout(false)}
            onPrivacy={() => {
              setShowAbout(false);
              setTimeout(() => setShowPrivacy(true), 100);
            }}
          />
        )}
        {showPrivacy && (
          <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
        )}
        {showAddTeam && (
          <AddTeamPopup
            onClose={() => setShowAddTeam(false)}
            onAddTeam={handleAddTeam}
            onShowTerms={() => {
              setShowAddTeam(false);
              setTimeout(() => setShowTerms(true), 200);
            }}
          />
        )}
        {showTerms && (
          <TermsOfService onClose={() => setShowTerms(false)} />
        )}
      </>
    );
  }

  return (
    <>
      {showAbout && <div className="blur-overlay"></div>}
      {showUpdates && <div className="blur-overlay"></div>}
      {showHelp && <div className="blur-overlay"></div>} 
      <Header onAboutClick={handleAbout} onPrivacyClick={() => setShowPrivacy(true)} />
      {showAbout && <About onClose={() => setShowAbout(false)} />}
      {showUpdates && <Updates onClose={() => setShowUpdates(false)} />}
      {showHelp && <HelpSupport onClose={() => setShowHelp(false)} />} 
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      <Routes>
        <Route path="/" element={<Hero onUpdatesClick={handleUpdates} onHelpClick={handleHelp} />} />
        <Route path="/meetings" element={<ManageMeetings />} />
        <Route path="/meeting/:roomId" element={<VideoCall />} />
      </Routes>
    </>
  );
}

export default App
