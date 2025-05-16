import { createSlice } from '@reduxjs/toolkit';

// Helper function to ensure numeric values
const ensureNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
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
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.error = null;
    },
    getUserSuccess: (state, action) => {
      const userData = action.payload;
      state.user = {
        ...userData,
        height: ensureNumeric(userData.height),
        weight: ensureNumeric(userData.weight),
        fitness_goal: ensureNumeric(userData.fitness_goal),
        initial_weight: ensureNumeric(userData.initial_weight)
      };

      state.loading = false;
      state.isAuthenticated = true;
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
      state.error = null;
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