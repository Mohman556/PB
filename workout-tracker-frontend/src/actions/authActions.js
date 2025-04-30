import { loginStart, loginSuccess, getUserSuccess, authError, logout, resetAuthState, clearError } from '../store/authSlice';
import * as authService from '../services/authServices';

export const loginUser = (username, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const data = await authService.login(username, password);
    // Check if the response contains access token
    if (!data.access) {
      console.error('No access token in response:', data);
      dispatch(authError('Login failed: No access token received'));
      return;
    }
    localStorage.setItem('token', data.access);
    dispatch(loginSuccess({ token: data.access }));
    dispatch(fetchCurrentUser(data.access));
  } catch (error) {
    // Log full technical error to console for developers
    console.error('Login error:', error);
    
    // Send a user-friendly error to the UI
    let userError;
    if (error.response?.data) {
      if (error.response.data.detail && 
         (error.response.data.detail.includes('No active account') || 
          error.response.data.detail.includes('credentials'))) {
        userError = { message: 'Invalid username or password. Please try again.' };
      } else {
        userError = error.response.data;
      }
    } else {
      userError = { message: 'Unable to connect. Please try again later.' };
    }
    
    dispatch(authError(userError));
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(loginStart());
    await authService.register(userData);
    const loginData = await authService.login(userData.username, userData.password);
    dispatch(loginSuccess({ token: loginData.access }));
    dispatch(fetchCurrentUser(loginData.access));
  } catch (error) {
    // Log full technical error to console for developers
    console.error('Registration error details:', error);
    
    // Format error for users
    let userError;
    if (error.response?.data) {
      // Handle common registration errors
      if (error.response.data.username) {
        userError = { username: 'This username is already taken. Please use a different username or log in.' };
      } else if (error.response.data.email) {
        userError = { email: 'This email is already registered. Please use a different email or log in.' };
      } else if (error.response.data.password) {
        userError = { password: error.response.data.password };
      } else {
        userError = error.response.data;
      }
    } else if (error.message) {
      userError = { message: 'Registration failed. Please try again.' };
    } else {
      userError = { message: 'Registration failed. Please try again.' };
    }
    
    dispatch(authError(userError));
  }
};

export const fetchCurrentUser = (token) => async (dispatch) => {
  try {
    const userData = await authService.getCurrentUser(token);
    dispatch(getUserSuccess(userData));
  } catch (error) {
    // Log detailed error to console
    console.error('User fetch error:', error);
    console.error('Response data:', error.response?.data);
    
    // For user data fetch failures, we can just log out without showing errors
    // since users don't need to see these technical issues
    dispatch(logout());
  }
};

export const loginWithGoogle = (credential) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    const response = await authService.googleLogin(credential);
    
    // Store token in localStorage
    localStorage.setItem('token', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Update Redux state
    dispatch(loginSuccess({ token: response.access }));
    
    // Set user data directly if available, or fetch it
    if (response.user) {
      dispatch(getUserSuccess(response.user));
    } else {
      dispatch(fetchCurrentUser(response.access));
    }
  } catch (error) {
    // Log detailed error to console
    console.error('Google login error:', error);
    
    // Show simplified message to user
    const userError = { message: 'Google login failed. Please try again or use email registration.' };
    dispatch(authError(userError));
  }
};

export const validateCredentials = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    // Call the validation endpoint
    await authService.validateCredentials(credentials);
    
    // If successful, clear any previous errors
    dispatch({ type: 'VALIDATE_CREDENTIALS_SUCCESS' });
    
    return true;
  } catch (error) {
    // Log detailed error to console
    console.error('Credential validation error:', error);
    
    // Format user-friendly error message
    let userError;
    if (error.response?.data) {
      if (error.response.data.username) {
        userError = { username: 'This username is already taken. Please use a different username or log in.' };
      } else if (error.response.data.email) {
        userError = { email: 'This email is already registered. Please use a different email or log in.' };
      } else {
        userError = error.response.data;
      }
    } else {
      userError = { message: 'Validation failed. Please check your information.' };
    }
    
    dispatch(authError(userError));
    return false;
  }
};

export const resetAuth = () => (dispatch) => {
  dispatch(resetAuthState());
};

export const clearAuthError = () => (dispatch) => {
  dispatch(clearError());
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  dispatch(logout());
};