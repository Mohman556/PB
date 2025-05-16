import { loginStart, loginSuccess, getUserSuccess, authError, logout, resetAuthState, clearError } from '../store/authSlice';
import * as authService from '../services/authServices';


// Helper function for ensuring numeric values
const ensureNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

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
    const processedUser = {
      ...userData,
      height: ensureNumeric(userData.height),
      weight: ensureNumeric(userData.weight),
      fitness_goal: ensureNumeric(userData.fitness_goal),
      initial_weight: ensureNumeric(userData.initial_weight)
    };
    dispatch(getUserSuccess(processedUser));
  } catch (error) {
    // Log detailed error to console
    console.error('User fetch error:', error);
    console.error('Response data:', error.response?.data);
    
    dispatch(logout());
  }
};

export const loginWithGoogle = (credential) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    console.log('Processing Google login with credential');
    
    // Call the API with improved error handling
    try {
      const response = await authService.googleLogin(credential);
      console.log('Google login API response received');
      
      // Check for the access token
      if (!response || !response.access) {
        console.error('Invalid response structure:', response);
        dispatch(authError({ message: 'Login failed: Invalid server response' }));
        return;
      }
      
      // Store token in localStorage
      localStorage.setItem('token', response.access);
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      // Update Redux with token
      dispatch(loginSuccess({ token: response.access }));
      
      // Process user data safely
      if (response.user) {
        console.log('User data received with Google login');
        
        // Ensure numeric values
        const processedUser = {
          ...response.user,
          height: ensureNumeric(response.user.height),
          weight: ensureNumeric(response.user.weight),
          fitness_goal: ensureNumeric(response.user.fitness_goal),
          initial_weight: ensureNumeric(response.user.initial_weight || response.user.weight)
        };
        
        dispatch(getUserSuccess(processedUser));
        
        // Save backup to localStorage for resilience
        try {
          localStorage.setItem('workout_tracker_profile', JSON.stringify({
            height: processedUser.height,
            weight: processedUser.weight,
            fitness_goal: processedUser.fitness_goal,
            initial_weight: processedUser.initial_weight,
            savedAt: new Date().toISOString()
          }));
        } catch (storageError) {
          console.warn('Failed to save profile backup:', storageError);
        }
      } else {
        console.log('No user data in response, fetching separately');
        dispatch(fetchCurrentUser());
      }
    } catch (apiError) {
      // Handle API-specific errors
      console.error('Google login API error:', apiError);
      
      let errorMessage = 'Google login failed. Please try again.';
      
      // Extract more specific error message if available
      if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      } else if (apiError.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      }
      
      dispatch(authError({ message: errorMessage }));
      return;
    }
  } catch (error) {
    console.error('Unhandled error in Google login action:', error);
    dispatch(authError({ 
      message: 'Login failed due to an unexpected error. Please try again.' 
    }));
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

export const updateUserProfile = (userData) => async (dispatch) => {
  try {
    console.log('updateUserProfile action called with data:', userData);

    const sanitizedData = {
      ...userData,
      height: ensureNumeric(userData.height),
      weight: ensureNumeric(userData.weight),
      fitness_goal: ensureNumeric(userData.fitness_goal),
      initial_weight: ensureNumeric(userData.initial_weight)
    };

    const updatedUser = await authService.updateProfile(sanitizedData);
    console.log('API response:', updatedUser);

    const processedUser = {
      ...updatedUser,
      height: ensureNumeric(updatedUser.height),
      weight: ensureNumeric(updatedUser.weight),
      fitness_goal: ensureNumeric(updatedUser.fitness_goal),
      initial_weight: ensureNumeric(updatedUser.initial_weight)
    };
    
    dispatch(getUserSuccess(processedUser));
    
    return processedUser;
    

  } catch (error) {
    console.error('Profile update failed in action:', error);
    throw error;
  }
};