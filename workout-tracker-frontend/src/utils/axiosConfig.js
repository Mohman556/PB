import axios from 'axios';
import store from '../store';
import { logout } from '../store/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Add token to requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle token expiration
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized response - logging out user');
      store.dispatch(logout());
    }
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;