import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    isAuthenticated: localStorage.getItem('token') ? true : false,
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
    },
    getUserSuccess: (state, action) => {
      state.user = action.payload;
    },
    authError: (state, action) => {
      const errorMessage = typeof action.payload === 'object' 
        ? JSON.stringify(action.payload) 
        : action.payload;
      
      state.error = errorMessage;
      state.loading = false;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
    },
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginStart, loginSuccess, getUserSuccess, authError, logout, resetAuthState, clearError } = authSlice.actions;
export default authSlice.reducer;