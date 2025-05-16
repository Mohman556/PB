import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../actions/authActions';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const buttonRef = useRef(null);
  const googleInitialized = useRef(false);

  useEffect(() => {
    // Create a direct callback function that Google can call
    window.handleGoogleSignIn = (response) => {
      console.log('Google sign-in response received');
      if (response && response.credential) {
        console.log('Credential received (first 10 chars):', response.credential.substring(0, 10) + '...');
        dispatch(loginWithGoogle(response.credential));
      } else {
        console.error('Invalid Google response received');
      }
    };

    // Function to load Google Identity Services script
    const loadGoogleScript = () => {
      // Check if script already exists
      if (document.getElementById('google-signin-script')) {
        initializeGoogleSignIn();
        return;
      }

      console.log('Loading Google Identity Services script');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-signin-script';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    // Function to initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (!window.google || !window.google.accounts || googleInitialized.current) {
        return;
      }

      try {
        console.log('Initializing Google Sign-In');
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: window.handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button if the ref exists
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(
            buttonRef.current,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: 260
            }
          );
          googleInitialized.current = true;
          console.log('Google Sign-In button rendered');
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };

    // Load the Google script
    loadGoogleScript();

    // Cleanup function
    return () => {
      // Remove the global callback
      delete window.handleGoogleSignIn;

      // Cancel Google Sign-In if it's initialized
      if (window.google && window.google.accounts && googleInitialized.current) {
        try {
          window.google.accounts.id.cancel();
          googleInitialized.current = false;
        } catch (e) {
          console.error('Error cancelling Google Sign-In:', e);
        }
      }
    };
  }, [dispatch]);

  return (
    <div 
      ref={buttonRef}
      id="google-login-button" 
      className="google-login-button"
      style={{ 
        marginTop: '1rem', 
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}
    ></div>
  );
};

export default GoogleLoginButton;