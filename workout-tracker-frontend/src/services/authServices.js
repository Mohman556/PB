import axiosInstance from '../utils/axiosConfig';


export const login = async (username, password) => {
  const response = await axiosInstance.post('auth/jwt/create/', { username, password });
  return response.data;
};

export const googleLogin = async (credential) => {
  try {
    console.log('Sending Google credential to backend: length:', credential?.length || 0);
    const payload = { credential };
    console.log('API request payload:', { credential: credential ? `${credential.substring(0, 15)}...` : null });

    const response = await axiosInstance.post(
      'users/google-login/', 
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('Google login API call successful:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Google login service error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
      if (error.response.status === 400){
        console.error('400 Bad Request - Check if the backend is properly handling the credential format');
        console.error('Backend validation error details:', error.response.data);
      }else if (error.response.status === 401){
        console.error('401 Unauthorized - Google token validation failed on the server');
      }
    } else if (error.request) {
      console.error('No response received. Request details:', {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      });
    }
    
    // Rethrow for action handler
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