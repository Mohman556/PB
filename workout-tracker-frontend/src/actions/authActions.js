import { loginStart, loginSuccess, getUserSuccess, authError, logout } from '../store/authSlice';
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
    console.error('Login error:', error);
    dispatch(authError(error.response?.data || 'Login failed'));
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
    // Format error response safely
    let errorMessage;
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Registration failed';
    }
    dispatch(authError(errorMessage));
  }
};

export const fetchCurrentUser = (token) => async (dispatch) => {
  try {
    console.log('Fetching user with token:', token);
    const userData = await authService.getCurrentUser(token);
    console.log('User data received:', userData);
    dispatch(getUserSuccess(userData));
  } catch (error) {
    console.error('Full error:', error);
    console.error('Response data:', error.response?.data);
    dispatch(authError(error.response?.data || 'Failed to fetch user'));
    dispatch(logout());
  }
};

export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};