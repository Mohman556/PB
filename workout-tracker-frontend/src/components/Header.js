import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../actions/authActions';
import { ThemeContext } from '../context/ThemeContext.js';
import './assets/css/Header.css';



function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
      
    <header className="header">
      <div className="header-container">
          <div className="logo">
              <Link to="/">MacroLanks</Link>
          </div>
          <nav className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              
              {isAuthenticated ? (
                  <>
                      <Link to="/dashboard" className="nav-link">Dashboard</Link>
                      <Link to="/profile" className="nav-link">Profile</Link>
                  </>
              ) : null}
              
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
                  
                  {isAuthenticated ? (
                      <>
                          <span className="welcome-text">Hello, {user?.username}</span>
                          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                      </>
                  ) : (
                      <>
                          <Link to="/login" className="btn btn-login">Login</Link>
                          <Link to="/register" className="btn btn-register">Sign Up</Link>
                      </>
                  )}
              </div>
          </nav>
      </div>
    </header>
  );
}

export default Header;