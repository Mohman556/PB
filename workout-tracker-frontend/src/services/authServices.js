import axiosInstance from '../utils/axiosConfig';


export const login = async (username, password) => {
  const response = await axiosInstance.post('auth/jwt/create/', { username, password });
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await axiosInstance.post('users/google-login/', { credential });
  return response.data;
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
  const response = await axiosInstance.patch('users/profile/', userData);
  return response.data;
};