import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.js';
import './assets/css/Header.css';


function Header() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        
        <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">Personal Best</Link>
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Profile</Link>
            <div className="auth-buttons">
                <div className="theme-toggle">
                <span className="sun-icon">☀️</span>
                <label className="switch">
                    <input 
                    type="checkbox" 
                    onChange={toggleTheme}
                    checked={theme === 'dark'}
                    />
                    <span className="slider round"></span>
                </label>
                <span className="moon-icon">🌙</span>
                </div>
              <Link to="/login" className="btn btn-login">Login</Link>
              <Link to="/register" className="btn btn-register">Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>
    );
}

export default Header;