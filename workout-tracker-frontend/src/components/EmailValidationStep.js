import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const EmailValidationStep = ({ onEmailValidated, onGoogleLogin }) => {
    const [email, setEmail] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
  
    const validateEmail = async (e) => {
      e.preventDefault();
      setIsValidating(true);
      setError(null);
      
      try {
        const response = await axios.post('http://localhost:8000/api/users/validate-email/', { email });
        
        if (response.data.exists) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          onEmailValidated(email);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to validate email');
      } finally {
        setIsValidating(false);
      }
    };
  
    const handleGoogleSuccess = async (credentialResponse) => {
      try {
        onGoogleLogin(credentialResponse);
      } catch (error) {
        setError('Google login failed. Please try again.');
      }
    };
  
    return (
      <div className="email-validation-container">
        <h2>Create Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={validateEmail}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isValidating}>
            {isValidating ? 'Checking...' : 'Continue'}
          </button>
        </form>
        
        <div className="separator">
          <span>OR</span>
        </div>
        
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
          />
        </div>
      </div>
    );
  };
  
  export default EmailValidationStep;