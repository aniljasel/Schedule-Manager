import { useState, useRef, useEffect } from "react";
import './LandingPage.css';
import logo from '../assets/logo.png';

function LandingPage({ onLogin, onRegister, onAbout, onPrivacy }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="landing-root">
      <header className="landing-header">
        <nav className="nav-info">
          <img src={logo} alt="logo" className="landing-logo" />
          <h1>Schedule Manager</h1>
        </nav>
        <nav className="nav-actions">
          <div className="nav-links">
            <a href="" onClick={onAbout}>About</a>
            <a href="" onClick={onLogin}>Login</a>
            <a href="" onClick={onRegister}>Register</a>
          </div>
          {/* Hamburger for mobile */}
          <button
            className="menu-toggle-landing"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          {/* Dropdown menu for mobile */}
          {isMenuOpen && (
            <>
              <div className="about-modal-overlay" onClick={() => setIsMenuOpen(false)} />
              <div className="dropdown-menu" ref={menuRef}>
                <a href="" onClick={() => { setIsMenuOpen(false); onAbout(); }}><i className="fas fa-user-circle"></i>About</a>
                <a href="" onClick={() => { setIsMenuOpen(false); onLogin(); }}><i className="fas fa-sign-in-alt"></i>Login</a>
                <a href="" onClick={() => { setIsMenuOpen(false); onRegister(); }}><i className="fas fa-user-plus"></i>Register</a>
                <a href="" onClick={e => { e.preventDefault(); setIsMenuOpen(false); onPrivacy(); }}><i className="fas fa-shield-alt"></i>Privacy Policy</a>
              </div>
            </>
          )}
        </nav>  
      </header>
      <main className="landing-main">
        <section className="landing-hero">
          <h2>Organize Your Life, Effortlessly</h2>
          <p>
            Schedule Manager helps you plan, organize, and manage your daily tasks and teams with ease.<br />
            Secure, fast, and built with the latest technology.
          </p>
          <div className="landing-actions">
            <button className="landing-btn" onClick={onRegister}>Get Started Free</button>
            <button className="landing-btn secondary" onClick={onAbout}>Learn More</button>
          </div>
        </section>
        <section className="landing-features">
          <div className='features-card'>
            <i className="fas fa-user-shield"></i>
            <h3>Privacy First</h3>
            <p>Your data is encrypted and never shared. Only you control your information.</p>
          </div>
          <div className='features-card'>
            <i className="fas fa-bolt"></i>
            <h3>Lightning Fast</h3>
            <p>Built with React, Firebase, and modern cloud tech for instant sync and updates.</p>
          </div>
          <div className='features-card'>
            <i className="fas fa-users"></i>
            <h3>Team Collaboration</h3>
            <p>Create teams, assign tasks, and work together in real time.</p>
          </div>
          <div className='features-card'>
            <i className="fas fa-calendar-check"></i>
            <h3>Smart Scheduling</h3>
            <p>Manage tasks, deadlines, and events with a beautiful calendar view.</p>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Schedule Manager. All rights reserved.</span>
        <a href="" onClick={e => { e.preventDefault(); onPrivacy(); }}>Privacy Policy</a>
      </footer>
    </div>
  );
}

export default LandingPage;