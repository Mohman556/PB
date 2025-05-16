import axiosInstance from '../utils/axiosConfig';
import axios from 'axios';


export const login = async (username, password) => {
  const response = await axiosInstance.post('auth/jwt/create/', { username, password });
  return response.data;
};

export const googleLogin = async (credential) => {
  try {
    console.log('Sending Google credential to backend');
    
    // Create request payload
    const payload = { credential };
    
    // Make the API request without Authorization header
    const response = await axios.post(
      'http://localhost:8000/api/users/google-login/',  // Make sure URL is correct
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Do NOT include Authorization header here
      }
    );
    
    console.log('Google login successful');
    return response.data;
  } catch (error) {
    console.error('Google login failed:', error.message);
    
    // Extract error details
    if (error.response?.data) {
      console.error('Server error details:', error.response.data);
    }
    
    throw error;
  }
};

export const register = async (userData) => {
  const response = await axiosInstance.post('auth/users/', userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await axiosInstance.get('auth/users/me/');
  return response.data;
};

export const validateCredentials = async (credentials) => {
  const response = await axiosInstance.post('users/validate-credentials/', credentials);
  return response.data;
};

export const updateProfile = async (userData) => {
  try {
    console.log('Sending profile update with data:', userData);
    const response = await axiosInstance.patch('users/profile/', userData);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateProfile service:', error.response?.data || error.message);
    throw error;
  }
};