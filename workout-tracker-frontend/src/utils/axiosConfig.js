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
  error => Promise.reject(error)
);

// Handle token expiration
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;