import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../actions/authActions';
import { Navigate, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import './assets/css/Log-Reg.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { username, password } = formData;
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Clear errors when user types
  useEffect(() => {
    dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = e => {
    if (error) {
      dispatch(clearAuthError());
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    dispatch(loginUser(username, password));
  };

  // Helper function to render error messages properly
  const renderUserFriendlyError = (error) => {
    if (!error) return null;
    
    // Log full error to console for developers
    console.error('Login error:', error);
    
    // Handle common user-facing errors
    if (typeof error === 'object') {
      // Incorrect credentials
      if (error.detail && (
        error.detail.includes('No active account') || 
        error.detail.includes('credentials') ||
        error.detail.includes('authentication')
      )) {
        return <div className="error-message">Invalid username or password. Please try again.</div>;
      }
      
      // Detail message (common in Django REST)
      if (error.detail) {
        return <div className="error-message">{error.detail}</div>;
      }
      
      // Non-field errors
      if (error.non_field_errors) {
        return <div className="error-message">{Array.isArray(error.non_field_errors) ? error.non_field_errors[0] : error.non_field_errors}</div>;
      }
    }
    
    // For string errors that match common authentication issues
    if (typeof error === 'string' && (
      error.includes('credentials') || 
      error.includes('login') || 
      error.includes('username') ||
      error.includes('password')
    )) {
      return <div className="error-message">{error}</div>;
    }
    
    // Generic user-friendly message for all other errors
    return <div className="error-message">Login failed. Please try again.</div>;
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-container">
      {/* <h2>Login</h2> */}
      {error && <div className="error-message">{renderUserFriendlyError(error)}</div>}
      
      <div className='form-container'>
        <form className='forms' onSubmit={onSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="form-footer">
            <p><Link to="/register" >Don't have an account? Sign up</Link></p>
          </div>  
        </form>

      </div>

      
      <div className="separator">
        <span>OR</span>
      </div>
      
      <div className="google-login-container">
        <GoogleLoginButton />
      </div>
      
    </div>
  );
};

export default Login;