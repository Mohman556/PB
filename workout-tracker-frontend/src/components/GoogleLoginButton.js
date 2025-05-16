import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../actions/authActions';
import axios from 'axios';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const scriptRef = useRef(null);
  const buttonContainerRef = useRef(null);
  
  useEffect(() => {
    const handleCredentialResponse = (response) => {
      console.log('Google credential response received:', response);
      
      if (response.credential) {
        // Log the first few characters of credential for debugging (not the whole thing for security)
        console.log('Credential received (first 15 chars):', response.credential.substring(0, 15) + '...');
        dispatch(loginWithGoogle(response.credential));
      } else {
        console.error('No credential received from Google');
      }
    };

    // Create a global callback function that Google can call
    // This helps prevent COOP issues
    window.handleGoogleSignIn = handleCredentialResponse;
    
    const loadGoogleScript = () => {
      if (scriptRef.current) return; // Prevent duplicate loading
      
      console.log('Loading Google Identity Services script');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true; // Add defer for better loading
      script.id = 'google-login-script';
      script.onload = initializeGoogleSignIn;
      script.onerror = () => console.error('Failed to load Google Identity Services script');
      
      document.head.appendChild(script); // Attach to head instead of body
      scriptRef.current = script;
    };
    
    const initializeGoogleSignIn = () => {
      console.log('Initializing Google Sign-In');
      
      if (!window.google || !window.google.accounts) {
        console.error('Google Identity Services not loaded properly');
        return;
      }
      
      try {
        // Clear any existing button
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = '';
        }
        
        // Initialize with global callback
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: window.handleGoogleSignIn, // Use the global function
          cancel_on_tap_outside: true,
          context: 'signin', // Specify the context explicitly
          ux_mode: 'popup', // Use popup to avoid redirect issues
        });
        
        // Render button
        if (buttonContainerRef.current) {
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center',
            width: 250
          });
          console.log('Google Sign-In button rendered');
        } else {
          console.error('Button container ref not available');
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };
    
    // Load the script
    loadGoogleScript();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up Google Sign-In');
      
      // Remove global callback
      delete window.handleGoogleSignIn;
      
      // Cancel any active Google Sign-In
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          console.error('Error cancelling Google Sign-In:', e);
        }
      }
      
      // We'll keep the script loaded for better performance
      // but we'll clean up the button container
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [dispatch]);

  return (
    <div 
      ref={buttonContainerRef}
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