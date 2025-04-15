import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../actions/authActions';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { username, password } = formData;
  
  // Access Redux state
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Update state on input change
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = e => {
    e.preventDefault();
    dispatch(loginUser(username, password));
  };
  
  // Helper function to render error messages properly
  const renderError = (error) => {
    if (!error) return null;
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (typeof error === 'object') {
      // If it has a detail property (common in DRF)
      if (error.detail) {
        return error.detail;
      }
      
      // If it has field-specific errors
      if (Object.keys(error).length > 0) {
        return (
          <ul className="error-list">
            {Object.entries(error).map(([field, message]) => (
              <li key={field}>
                <strong>{field}:</strong> {Array.isArray(message) ? message[0] : message}
              </li>
            ))}
          </ul>
        );
      }
    }
    
    // Fallback
    return 'An error occurred';
  };

  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && (
        <div className="error-message">
          {(() => {
            try {
              return typeof error === 'string' 
                ? error 
                : (error.detail || JSON.stringify(error));
            } catch (e) {
              return 'Authentication error';
            }
          })()}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
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
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;