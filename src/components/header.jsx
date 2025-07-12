import { useState, useEffect, useRef } from 'react';
import './header.css';
import logo from '../assets/logo.png';

function Header({ onAboutClick, onPrivacyClick }) {
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef(null);
  const menuToggleRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !menuToggleRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <nav className="nav-left">
        <img src={logo} alt="image" />
        <h1>Schedule Manager</h1>
      </nav>
      <nav className="nav-right">
        <a href="" className="about-link" onClick={onAboutClick}>About</a>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
        </button>
        <button className="menu-toggle" onClick={toggleMenu} ref={menuToggleRef}>
            <span></span>
            <span></span>
            <span></span>
        </button>
        {/* dropdown menu ------*/}
        {isMenuOpen && isMobile && (
          <div className="about-modal-overlay">
            <div className="dropdown-menu" ref={dropdownRef}>
              <a
                  href="#"
                  id="About-btn"
                  onClick={e => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    onAboutClick(e);
                  }}
              >
                <i className="fas fa-user-circle"></i>About
              </a>
                <a
                  href="#"
                  id="Privacy-btn"
                  onClick={e => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    onPrivacyClick(e);
                  }}
                >
                  <i className="fas fa-shield-alt"></i>Privacy Policy
                </a>
              <button className="theme-toggle" onClick={toggleTheme}>
                <span><i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>Theme</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;