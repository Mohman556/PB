import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../actions/authActions';
import { Navigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: '',
    feet: '',
    inches: '',
    weight: '',
    fitness_goal: '',
    date_of_birth: ''
  });
      
      
  const { username, email, password, re_password, feet, inches, weight, fitness_goal, date_of_birth } = formData;
  
  // Access Redux state
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Update state on input change (same as login)
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission with validation
  const onSubmit = e => {
    e.preventDefault();
    
    // Client-side validation for password matching
    if (password !== re_password) {
      alert('Passwords do not match');
      return;
    }

    // Convert feet and inches to centimeters for backend storage
    const height = feet && inches 
      ? (parseFloat(feet) * 30.48 + parseFloat(inches) * 2.54).toFixed(2) 
      : '';
    
    const submissionData = {
      ...formData,
      height: height || null,  
    };

    delete submissionData.feet;
    delete submissionData.inches;
    
    // Dispatch registration action
    dispatch(registerUser(submissionData));
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

  // Redirect if registration succeeded and user is authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="register-container">
      <h2>Register</h2>
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
          <input type="text" name="username" value={username} onChange={onChange} required />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" name="re_password" value={re_password} onChange={onChange} required />
        </div>
        
        <div className="form-group height-input">
          <label>Height</label>
          <div className="height-fields">
            <div className="feet-field">
              <input 
                type="number" 
                name="feet" 
                value={feet} 
                onChange={onChange} 
                min="0" 
                max="8" 
                placeholder="ft"
              />
              <span>ft</span>
            </div>
            <div className="inches-field">
              <input 
                type="number" 
                name="inches" 
                value={inches} 
                onChange={onChange} 
                min="0" 
                max="11" 
                placeholder="in"
              />
              <span>in</span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Weight (lbs)</label>
          <input 
            type="number" 
            name="weight" 
            value={weight} 
            onChange={onChange} 
            min="0" 
            placeholder="lbs"
          />
        </div>
        
        <div className="form-group">
          <label>Fitness Goal</label>
          <input type="text" name="fitness_goal" value={fitness_goal} onChange={onChange} />
        </div>
        
        <div className="form-group">
          <label>Date of Birth</label>
          <input type="date" name="date_of_birth" value={date_of_birth} onChange={onChange} />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;