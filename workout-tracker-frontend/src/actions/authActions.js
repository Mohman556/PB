import { loginStart, loginSuccess, getUserSuccess, authError, logout, resetAuthState, clearError } from '../store/authSlice';
import * as authService from '../services/authServices';


// Helper function for ensuring numeric values
const ensureNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Helper function to safely process user data
const processUserData = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    // Handle numeric fields safely
    height: ensureNumeric(userData.height),
    weight: ensureNumeric(userData.weight),
    fitness_goal: ensureNumeric(userData.fitness_goal),
    initial_weight: ensureNumeric(userData.initial_weight)
  };
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
    
    console.log('Attempting Google login with credential');
    
    // Call the API
    const response = await authService.googleLogin(credential);
    console.log('Google login API response received:', response);
    
    // Check for the access token
    if (!response.access) {
      console.error('No access token in response:', response);
      dispatch(authError({ message: 'Login failed: No access token received' }));
      return;
    }
    
    // Store token in localStorage
    localStorage.setItem('token', response.access);
    if (response.refresh) {
      localStorage.setItem('refreshToken', response.refresh);
    }
    
    // Update Redux with token
    dispatch(loginSuccess({ token: response.access }));
    
    // Handle user data
    if (response.user) {
      console.log('User data received in Google login response');
      
      // Try-catch to ensure graceful handling if user data parsing fails
      try {
        // Ensure numeric values for user data
        const processedUser = {
          ...response.user,
          height: ensureNumeric(response.user.height),
          weight: ensureNumeric(response.user.weight),
          fitness_goal: ensureNumeric(response.user.fitness_goal),
          initial_weight: ensureNumeric(response.user.initial_weight)
        };
        
        console.log('Processed user data:', processedUser);
        dispatch(getUserSuccess(processedUser));
      } catch (dataError) {
        console.error('Error processing user data:', dataError);
        
        // Create clean user object with nulls for profile metrics
        const defaultUser = {
          username: response.user.username || '',
          email: response.user.email || '',
          height: null,
          weight: null, 
          fitness_goal: null,
          initial_weight: null
        };
        
        console.log('Using default user data with null metrics:', defaultUser);
        dispatch(getUserSuccess(defaultUser));
      }
    } else {
      console.log('No user data in response, fetching separately');
      
      // Fetch user data separately
      try {
        const userData = await authService.getCurrentUser();
        console.log('User data fetched after Google login:', userData);
        
        // Process to ensure numeric types
        const processedUser = {
          ...userData,
          height: ensureNumeric(userData.height),
          weight: ensureNumeric(userData.weight),
          fitness_goal: ensureNumeric(userData.fitness_goal),
          initial_weight: ensureNumeric(userData.initial_weight) 
        };
        
        dispatch(getUserSuccess(processedUser));
      } catch (fetchError) {
        console.error('Failed to fetch user after Google login:', fetchError);
        
        // Default user with email from token if possible
        const defaultUser = {
          username: 'User',
          email: response.email || '',
          height: null,
          weight: null,
          fitness_goal: null,
          initial_weight: null
        };
        
        console.log('Using minimal default user data:', defaultUser);
        dispatch(getUserSuccess(defaultUser));
      }
    }
  } catch (error) {
    console.error('Google login error:', error);
    
    // Log detailed error info for debugging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
    // Show simplified message to user
    const userError = { 
      message: 'Google login failed. Please try again or use email registration.',
      details: error.message
    };
    
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