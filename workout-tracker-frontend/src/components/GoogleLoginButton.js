import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../actions/authActions';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize Google One Tap
    const initializeGoogleOneTap = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
        );
      }
    };

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = initializeGoogleOneTap;
    script.async = true;
    document.body.appendChild(script);

    const handleCredentialResponse = (response) => {
      if (response.credential) {
        dispatch(loginWithGoogle(response.credential));
      }
    };

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, [dispatch]);



  return <div id="google-login-button" className="google-login-button"></div>;
};

export default GoogleLoginButton;