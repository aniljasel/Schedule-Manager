import { useState, useEffect, useRef } from 'react';
import './header.css';

function Header() {
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef(null);
  const menuToggleRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme); // Ensure global theme update
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMenuOpen(false); // Close menu on desktop resize
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
        <button className="menu-toggle" onClick={toggleMenu} ref={menuToggleRef}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <img src="src//assets//user.png" alt="image" />
        <a href=""><h1>Schedule Manager</h1></a>
      </nav>
      <nav className="nav-right">
        <a href="" className="about-link">About</a>
        {isMenuOpen && isMobile && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <a href="" className="dropdown-item">About</a>
          </div>
        )}
        <button className="theme-toggle" onClick={toggleTheme}>
          <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
        </button>
      </nav>
    </header>
  );
}

export default Header;