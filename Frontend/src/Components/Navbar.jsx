import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      {/* Logo */}
      <div className="logo">
        <Link to="/" className="logo-link">
          <span className="logo-text">LaxiMind AI</span>
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <div className="nav-links">
        <Link to="/pricing" className="nav-link-item">Product</Link>
        <Link to="/pricing" className="nav-link-item">Solution</Link>
        <Link to="/pricing" className="nav-link-item">Pricing</Link>
        <Link to="/login" className="nav-link-item">Login</Link>
        <Link to="/get-started" className="nav-btn-cta">
          Get Started
        </Link>
      </div>

      {/* Hamburger Button (mobile) */}
      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu${menuOpen ? ' mobile-menu-open' : ''}`}>
        <Link to="/pricing" className="mobile-nav-link">Product</Link>
        <Link to="/pricing" className="mobile-nav-link">Solution</Link>
        <Link to="/pricing" className="mobile-nav-link">Pricing</Link>
        <Link to="/login" className="mobile-nav-link">Login</Link>
        <Link to="/get-started" className="mobile-nav-btn">
          Get Started →
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;